# 微博 Feed 流系统设计

## 1. 需求分析

### 1.1 功能需求
- **发布微博**：用户可以发布文本、图片、视频等内容
- **Feed 流展示**：用户可以查看关注人的微博动态
- **社交互动**：点赞、评论、转发
- **关注关系**：用户之间的关注与被关注
- **热门推荐**：基于算法的内容推荐

### 1.2 非功能需求
- **高并发**：支持 10 万 QPS 的请求
- **低延迟**：Feed 流获取延迟 < 100ms
- **高可用**：系统可用性 > 99.9%
- **可扩展**：支持水平扩展
- **数据一致性**：最终一致性

## 2. 系统规模估算

### 2.1 用户规模
- 日活跃用户（DAU）：1000 万
- 月活跃用户（MAU）：5000 万
- 总注册用户：1 亿

### 2.2 数据规模
- 平均每用户关注数：200
- 平均每用户粉丝数：200
- 每日新增微博数：1000 万
- 平均每条微博大小：1KB
- 图片/视频占比：30%

### 2.3 流量估算
- 读写比例：100:1
- 峰值 QPS：10 万
- 日均 QPS：2 万
- Feed 流刷新频率：每用户每天 20 次

### 2.4 存储估算
- 微博数据：10M * 1KB * 365 = 3.65TB/年
- 媒体文件：10M * 0.3 * 1MB * 365 = 1PB/年
- 关系数据：1亿 * 200 * 8B = 160GB
- 缓存需求：热点数据约 100GB 

## 3. 系统架构设计

### 3.1 整体架构

```
┌─────────────────────────────────────────────────────────────────┐
│                           CDN                                    │
└─────────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────────┐
│                      API Gateway (Kong/Spring Cloud Gateway)     │
└─────────────────────────────────────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│  Feed Service │     │ Tweet Service │     │  User Service │
└───────────────┘     └───────────────┘     └───────────────┘
        │                       │                       │
        ├───────────────────────┼───────────────────────┤
        │                       │                       │
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│     Redis     │     │    Kafka      │     │   MySQL       │
│   Cluster     │     │   Cluster     │     │   Cluster     │
└───────────────┘     └───────────────┘     └───────────────┘
        │                       │                       │
┌───────────────────────────────────────────────────────────────┐
│                    对象存储 (OSS/S3)                            │
└───────────────────────────────────────────────────────────────┘
```

### 3.2 核心组件

#### 3.2.1 API 网关层
- **技术选型**：Spring Cloud Gateway / Kong
- **功能职责**：
  - 请求路由和负载均衡
  - 认证授权（JWT Token）
  - 限流熔断（Sentinel）
  - 请求日志和监控

#### 3.2.2 微服务层

**Feed Service（Feed 流服务）**
- 负责 Feed 流的生成和获取
- 实现拉模式、推模式和混合模式
- 管理用户时间线

**Tweet Service（微博服务）**
- 微博的发布、删除、修改
- 点赞、评论、转发功能
- 微博内容的存储和检索

**User Service（用户服务）**
- 用户注册、登录、信息管理
- 关注关系的维护
- 用户画像和标签管理

**Media Service（媒体服务）**
- 图片、视频的上传和处理
- CDN 分发
- 媒体文件的存储管理

**Notification Service（通知服务）**
- 系统通知推送
- @提醒、评论通知
- 消息队列消费

#### 3.2.3 存储层

**MySQL 集群**
- 主从复制 + 读写分离
- 分库分表（ShardingSphere）
- 存储用户信息、微博元数据、关系数据

**Redis 集群**
- 缓存热点数据
- 存储 Feed 流（Timeline）
- 计数器（点赞数、评论数）
- 分布式锁

**Kafka 集群**
- 异步消息处理
- Feed 流推送
- 系统解耦

**ElasticSearch**
- 微博内容搜索
- 用户搜索
- 热词统计

**对象存储**
- 存储图片、视频等媒体文件
- CDN 加速
- 冷热数据分离 

## 4. 数据模型设计

### 4.1 核心数据表

#### 4.1.1 用户表（user）
```sql
CREATE TABLE `user` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL,
  `email` VARCHAR(100),
  `password` VARCHAR(128),
  `nickname` VARCHAR(50),
  `avatar` VARCHAR(255),
  `bio` VARCHAR(500),
  `follower_count` INT DEFAULT 0,
  `following_count` INT DEFAULT 0,
  `tweet_count` INT DEFAULT 0,
  `status` TINYINT DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_username` (`username`),
  KEY `idx_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

#### 4.1.2 微博表（tweet）
```sql
CREATE TABLE `tweet` (
  `id` BIGINT NOT NULL,
  `user_id` BIGINT NOT NULL,
  `content` TEXT,
  `media_urls` JSON,
  `like_count` INT DEFAULT 0,
  `comment_count` INT DEFAULT 0,
  `retweet_count` INT DEFAULT 0,
  `type` TINYINT DEFAULT 1 COMMENT '1:原创 2:转发',
  `original_tweet_id` BIGINT,
  `status` TINYINT DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_created` (`user_id`, `created_at`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

#### 4.1.3 关注关系表（follow）
```sql
CREATE TABLE `follow` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `follower_id` BIGINT NOT NULL,
  `following_id` BIGINT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_follower_following` (`follower_id`, `following_id`),
  KEY `idx_following_id` (`following_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

#### 4.1.4 点赞表（like）
```sql
CREATE TABLE `like` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL,
  `tweet_id` BIGINT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_user_tweet` (`user_id`, `tweet_id`),
  KEY `idx_tweet_id` (`tweet_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 4.2 分库分表策略

#### 4.2.1 用户表分表
- 分表键：user_id
- 分表数量：128 张表
- 分表算法：user_id % 128

#### 4.2.2 微博表分表
- 分表键：tweet_id（雪花算法生成）
- 分表数量：256 张表
- 分表算法：tweet_id % 256
- 按时间分区：每月一个分区

#### 4.2.3 关系表分表
- 分表键：follower_id
- 分表数量：64 张表
- 分表算法：follower_id % 64

### 4.3 缓存设计

#### 4.3.1 用户信息缓存
```
Key: user:info:{user_id}
Value: User对象JSON
TTL: 1天
```

#### 4.3.2 关注列表缓存
```
Key: user:following:{user_id}
Value: Set<user_id>
TTL: 1小时
```

#### 4.3.3 粉丝列表缓存
```
Key: user:followers:{user_id}
Value: Set<user_id>
TTL: 1小时
```

#### 4.3.4 微博内容缓存
```
Key: tweet:content:{tweet_id}
Value: Tweet对象JSON
TTL: 7天
```

#### 4.3.5 Feed流缓存
```
Key: feed:timeline:{user_id}
Value: List<tweet_id> (有序列表)
Score: 时间戳
TTL: 3天
```

### 4.4 ID生成策略

采用雪花算法（Snowflake）生成分布式ID：
- 1位符号位
- 41位时间戳
- 10位机器ID（5位数据中心 + 5位机器ID）
- 12位序列号 

## 5. Feed 流生成策略

### 5.1 三种模式对比

| 模式 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| 拉模式 | 写入简单、存储少 | 读取慢、计算量大 | 粉丝少的用户 |
| 推模式 | 读取快、用户体验好 | 写入慢、存储多 | 粉丝多的用户 |
| 混合模式 | 平衡读写性能 | 实现复杂 | 大规模系统 |

### 5.2 混合模式设计

#### 5.2.1 用户分级策略
```java
public enum UserType {
    NORMAL(1000),      // 普通用户，粉丝 < 1000
    ACTIVE(10000),     // 活跃用户，粉丝 < 10000  
    BIG_V(100000),     // 大V用户，粉丝 < 100000
    SUPER_V(Integer.MAX_VALUE); // 超级大V
    
    private final int maxFollowers;
}
```

#### 5.2.2 Feed 流生成策略
- **普通用户**：完全推模式
- **活跃用户**：推模式 + 限制推送数量
- **大V用户**：拉模式 + 缓存优化
- **超级大V**：纯拉模式

#### 5.2.3 推模式实现
```java
@Service
public class PushFeedService {
    @Autowired
    private RedisTemplate<String, String> redisTemplate;
    
    @Async
    public void pushToFollowers(Tweet tweet) {
        Long userId = tweet.getUserId();
        Set<Long> followers = getFollowers(userId);
        
        // 批量推送，每批1000个
        Lists.partition(new ArrayList<>(followers), 1000)
            .forEach(batch -> {
                Pipeline pipeline = redisTemplate.pipelined();
                batch.forEach(followerId -> {
                    String key = "feed:timeline:" + followerId;
                    pipeline.zadd(key, tweet.getCreatedAt().getTime(), 
                                 tweet.getId().toString());
                    // 只保留最近1000条
                    pipeline.zremrangeByRank(key, 0, -1001);
                });
                pipeline.sync();
            });
    }
}
```

#### 5.2.4 拉模式实现
```java
@Service
public class PullFeedService {
    @Autowired
    private TweetService tweetService;
    
    public List<Tweet> pullFeed(Long userId, int page, int size) {
        // 获取关注列表
        Set<Long> followingIds = getFollowingIds(userId);
        
        // 从每个关注者获取最新微博
        List<Tweet> allTweets = followingIds.parallelStream()
            .map(followingId -> tweetService.getRecentTweets(followingId, 20))
            .flatMap(List::stream)
            .collect(Collectors.toList());
        
        // 按时间排序并分页
        return allTweets.stream()
            .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
            .skip(page * size)
            .limit(size)
            .collect(Collectors.toList());
    }
}
```

#### 5.2.5 混合模式实现
```java
@Service
public class HybridFeedService {
    @Autowired
    private PushFeedService pushService;
    @Autowired
    private PullFeedService pullService;
    @Autowired
    private UserService userService;
    
    public List<Tweet> getFeed(Long userId, int page, int size) {
        List<Tweet> pushTweets = getPushTweets(userId, page, size);
        List<Tweet> pullTweets = getPullTweets(userId);
        
        // 合并去重
        return Stream.concat(pushTweets.stream(), pullTweets.stream())
            .distinct()
            .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
            .limit(size)
            .collect(Collectors.toList());
    }
    
    private List<Tweet> getPushTweets(Long userId, int page, int size) {
        String key = "feed:timeline:" + userId;
        Set<String> tweetIds = redisTemplate.opsForZSet()
            .reverseRange(key, page * size, (page + 1) * size - 1);
        return tweetService.batchGetTweets(tweetIds);
    }
    
    private List<Tweet> getPullTweets(Long userId) {
        // 获取大V关注列表
        Set<Long> bigVIds = userService.getBigVFollowings(userId);
        return bigVIds.parallelStream()
            .map(bigVId -> tweetService.getRecentTweets(bigVId, 10))
            .flatMap(List::stream)
            .collect(Collectors.toList());
    }
}
```

### 5.3 优化策略

#### 5.3.1 预计算
- 定时任务预生成热门用户的 Feed 流
- 使用机器学习预测用户活跃时间

#### 5.3.2 智能推送
- 根据用户活跃度决定推送深度
- 活跃用户推送最近7天
- 非活跃用户只推送最近1天

#### 5.3.3 降级策略
- 高峰期只展示最近100条
- 降低大V推送频率
- 延迟非核心功能 

## 6. API 接口设计

### 6.1 用户相关接口

#### 6.1.1 用户注册
```
POST /api/v1/users/register
Request:
{
    "username": "string",
    "password": "string",
    "email": "string"
}
Response:
{
    "code": 0,
    "data": {
        "userId": 123456,
        "token": "jwt_token"
    }
}
```

#### 6.1.2 关注/取消关注
```
POST /api/v1/users/{userId}/follow
DELETE /api/v1/users/{userId}/follow
Headers: Authorization: Bearer {token}
Response:
{
    "code": 0,
    "message": "success"
}
```

### 6.2 微博相关接口

#### 6.2.1 发布微博
```
POST /api/v1/tweets
Headers: Authorization: Bearer {token}
Request:
{
    "content": "string",
    "mediaUrls": ["url1", "url2"]
}
Response:
{
    "code": 0,
    "data": {
        "tweetId": 789012,
        "createdAt": "2024-01-01T00:00:00Z"
    }
}
```

#### 6.2.2 获取 Feed 流
```
GET /api/v1/feed?page=1&size=20
Headers: Authorization: Bearer {token}
Response:
{
    "code": 0,
    "data": {
        "tweets": [
            {
                "tweetId": 123,
                "userId": 456,
                "content": "string",
                "mediaUrls": [],
                "likeCount": 100,
                "commentCount": 20,
                "retweetCount": 5,
                "createdAt": "2024-01-01T00:00:00Z"
            }
        ],
        "hasNext": true
    }
}
```

### 6.3 核心流程实现

#### 6.3.1 发布微博流程
```java
@RestController
@RequestMapping("/api/v1/tweets")
public class TweetController {
    
    @PostMapping
    public ResponseEntity<ApiResponse> createTweet(@RequestBody TweetRequest request) {
        // 1. 参数校验
        validateTweetRequest(request);
        
        // 2. 生成微博ID
        Long tweetId = idGenerator.nextId();
        
        // 3. 保存到数据库
        Tweet tweet = new Tweet();
        tweet.setId(tweetId);
        tweet.setUserId(getCurrentUserId());
        tweet.setContent(request.getContent());
        tweet.setMediaUrls(request.getMediaUrls());
        tweetService.save(tweet);
        
        // 4. 更新用户微博计数
        userService.incrementTweetCount(getCurrentUserId());
        
        // 5. 异步推送到粉丝时间线
        kafkaTemplate.send("tweet-publish", tweet);
        
        // 6. 缓存微博内容
        cacheService.cacheTweet(tweet);
        
        return ResponseEntity.ok(ApiResponse.success(tweet));
    }
}
```

#### 6.3.2 获取 Feed 流程
```java
@GetMapping("/feed")
public ResponseEntity<ApiResponse> getFeed(
        @RequestParam(defaultValue = "1") int page,
        @RequestParam(defaultValue = "20") int size) {
    
    Long userId = getCurrentUserId();
    
    // 1. 先从缓存获取
    List<Tweet> cachedFeed = cacheService.getFeed(userId, page, size);
    if (cachedFeed != null && !cachedFeed.isEmpty()) {
        return ResponseEntity.ok(ApiResponse.success(cachedFeed));
    }
    
    // 2. 根据用户类型选择策略
    UserType userType = userService.getUserType(userId);
    List<Tweet> feed;
    
    switch (userType) {
        case NORMAL:
        case ACTIVE:
            // 使用推模式
            feed = pushFeedService.getFeed(userId, page, size);
            break;
        case BIG_V:
        case SUPER_V:
            // 使用拉模式
            feed = pullFeedService.getFeed(userId, page, size);
            break;
        default:
            // 使用混合模式
            feed = hybridFeedService.getFeed(userId, page, size);
    }
    
    // 3. 填充用户信息和交互数据
    enrichTweetData(feed);
    
    // 4. 缓存结果
    cacheService.cacheFeed(userId, page, feed);
    
    return ResponseEntity.ok(ApiResponse.success(feed));
}
```

#### 6.3.3 点赞流程
```java
@PostMapping("/{tweetId}/like")
public ResponseEntity<ApiResponse> likeTweet(@PathVariable Long tweetId) {
    Long userId = getCurrentUserId();
    
    // 1. 使用分布式锁防止重复点赞
    String lockKey = "like:lock:" + userId + ":" + tweetId;
    boolean locked = redisLock.tryLock(lockKey, 5, TimeUnit.SECONDS);
    
    if (!locked) {
        return ResponseEntity.ok(ApiResponse.error("操作太频繁"));
    }
    
    try {
        // 2. 检查是否已点赞
        if (likeService.hasLiked(userId, tweetId)) {
            return ResponseEntity.ok(ApiResponse.error("已经点赞"));
        }
        
        // 3. 保存点赞记录
        likeService.addLike(userId, tweetId);
        
        // 4. 更新点赞计数（使用Redis计数器）
        String countKey = "tweet:like:count:" + tweetId;
        redisTemplate.opsForValue().increment(countKey);
        
        // 5. 异步更新数据库计数
        kafkaTemplate.send("like-event", new LikeEvent(userId, tweetId));
        
        return ResponseEntity.ok(ApiResponse.success());
        
    } finally {
        redisLock.unlock(lockKey);
    }
}
``` 

## 7. 核心组件实现

### 7.1 雪花算法ID生成器
```java
@Component
public class SnowflakeIdGenerator {
    private static final long START_TIMESTAMP = 1609459200000L; // 2021-01-01
    private static final long SEQUENCE_BIT = 12;
    private static final long MACHINE_BIT = 5;
    private static final long DATACENTER_BIT = 5;
    
    private static final long MAX_SEQUENCE = ~(-1L << SEQUENCE_BIT);
    private static final long MAX_MACHINE_NUM = ~(-1L << MACHINE_BIT);
    private static final long MAX_DATACENTER_NUM = ~(-1L << DATACENTER_BIT);
    
    private final long datacenterId;
    private final long machineId;
    private long sequence = 0L;
    private long lastTimestamp = -1L;
    
    public SnowflakeIdGenerator(long datacenterId, long machineId) {
        if (datacenterId > MAX_DATACENTER_NUM || datacenterId < 0) {
            throw new IllegalArgumentException("Datacenter ID invalid");
        }
        if (machineId > MAX_MACHINE_NUM || machineId < 0) {
            throw new IllegalArgumentException("Machine ID invalid");
        }
        this.datacenterId = datacenterId;
        this.machineId = machineId;
    }
    
    public synchronized long nextId() {
        long timestamp = System.currentTimeMillis();
        
        if (timestamp < lastTimestamp) {
            throw new RuntimeException("Clock moved backwards");
        }
        
        if (timestamp == lastTimestamp) {
            sequence = (sequence + 1) & MAX_SEQUENCE;
            if (sequence == 0L) {
                timestamp = tilNextMillis(lastTimestamp);
            }
        } else {
            sequence = 0L;
        }
        
        lastTimestamp = timestamp;
        
        return ((timestamp - START_TIMESTAMP) << (DATACENTER_BIT + MACHINE_BIT + SEQUENCE_BIT))
                | (datacenterId << (MACHINE_BIT + SEQUENCE_BIT))
                | (machineId << SEQUENCE_BIT)
                | sequence;
    }
    
    private long tilNextMillis(long lastTimestamp) {
        long timestamp = System.currentTimeMillis();
        while (timestamp <= lastTimestamp) {
            timestamp = System.currentTimeMillis();
        }
        return timestamp;
    }
}
```

### 7.2 分布式锁实现
```java
@Component
public class RedisDistributedLock {
    @Autowired
    private StringRedisTemplate redisTemplate;
    
    public boolean tryLock(String key, long timeout, TimeUnit unit) {
        String value = UUID.randomUUID().toString();
        Boolean success = redisTemplate.opsForValue()
            .setIfAbsent(key, value, timeout, unit);
        return Boolean.TRUE.equals(success);
    }
    
    public boolean tryLockWithRetry(String key, long timeout, TimeUnit unit, 
                                   int maxRetries, long retryDelay) {
        for (int i = 0; i < maxRetries; i++) {
            if (tryLock(key, timeout, unit)) {
                return true;
            }
            try {
                Thread.sleep(retryDelay);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                return false;
            }
        }
        return false;
    }
    
    public void unlock(String key) {
        redisTemplate.delete(key);
    }
}
```

### 7.3 限流器实现
```java
@Component
public class RateLimiter {
    @Autowired
    private StringRedisTemplate redisTemplate;
    
    /**
     * 滑动窗口限流
     */
    public boolean isAllowed(String key, int limit, int windowSeconds) {
        long now = System.currentTimeMillis();
        long windowStart = now - windowSeconds * 1000;
        
        String redisKey = "rate_limit:" + key;
        
        // 使用 Redis 的 ZSET 实现滑动窗口
        redisTemplate.opsForZSet().removeRangeByScore(redisKey, 0, windowStart);
        
        Long count = redisTemplate.opsForZSet().count(redisKey, windowStart, now);
        
        if (count < limit) {
            redisTemplate.opsForZSet().add(redisKey, UUID.randomUUID().toString(), now);
            redisTemplate.expire(redisKey, windowSeconds, TimeUnit.SECONDS);
            return true;
        }
        
        return false;
    }
    
    /**
     * 令牌桶限流
     */
    public boolean tryAcquire(String key, int rate, int capacity) {
        String tokenKey = "token_bucket:" + key;
        String timestampKey = "token_timestamp:" + key;
        
        Long lastRefillTime = redisTemplate.opsForValue().get(timestampKey) != null ?
            Long.parseLong(redisTemplate.opsForValue().get(timestampKey)) : 
            System.currentTimeMillis();
        
        long now = System.currentTimeMillis();
        long tokensToAdd = ((now - lastRefillTime) / 1000) * rate;
        
        String tokens = redisTemplate.opsForValue().get(tokenKey);
        long currentTokens = tokens != null ? Long.parseLong(tokens) : capacity;
        currentTokens = Math.min(currentTokens + tokensToAdd, capacity);
        
        if (currentTokens >= 1) {
            currentTokens--;
            redisTemplate.opsForValue().set(tokenKey, String.valueOf(currentTokens));
            redisTemplate.opsForValue().set(timestampKey, String.valueOf(now));
            return true;
        }
        
        return false;
    }
}
```

### 7.4 缓存服务实现
```java
@Service
public class CacheService {
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    private static final String TWEET_KEY_PREFIX = "tweet:content:";
    private static final String FEED_KEY_PREFIX = "feed:timeline:";
    private static final String USER_KEY_PREFIX = "user:info:";
    
    /**
     * 缓存微博内容
     */
    public void cacheTweet(Tweet tweet) {
        String key = TWEET_KEY_PREFIX + tweet.getId();
        redisTemplate.opsForValue().set(key, tweet, 7, TimeUnit.DAYS);
    }
    
    /**
     * 批量获取微博
     */
    public List<Tweet> batchGetTweets(Collection<String> tweetIds) {
        List<String> keys = tweetIds.stream()
            .map(id -> TWEET_KEY_PREFIX + id)
            .collect(Collectors.toList());
        
        List<Object> tweets = redisTemplate.opsForValue().multiGet(keys);
        
        return tweets.stream()
            .filter(Objects::nonNull)
            .map(obj -> (Tweet) obj)
            .collect(Collectors.toList());
    }
    
    /**
     * 缓存Feed流
     */
    public void cacheFeed(Long userId, int page, List<Tweet> tweets) {
        String key = FEED_KEY_PREFIX + userId + ":" + page;
        redisTemplate.opsForValue().set(key, tweets, 5, TimeUnit.MINUTES);
    }
    
    /**
     * 使用布隆过滤器防止缓存穿透
     */
    @Component
    public class BloomFilterService {
        private final BloomFilter<Long> tweetBloomFilter;
        
        public BloomFilterService() {
            // 预计存储1亿条微博，误判率0.01
            this.tweetBloomFilter = BloomFilter.create(
                Funnels.longFunnel(), 
                100_000_000, 
                0.01
            );
        }
        
        public void add(Long tweetId) {
            tweetBloomFilter.put(tweetId);
        }
        
        public boolean mightContain(Long tweetId) {
            return tweetBloomFilter.mightContain(tweetId);
        }
    }
}
```

### 7.5 消息处理实现
```java
@Component
public class FeedPushConsumer {
    @Autowired
    private RedisTemplate<String, String> redisTemplate;
    @Autowired
    private UserService userService;
    
    @KafkaListener(topics = "tweet-publish", groupId = "feed-push-group")
    public void handleTweetPublish(Tweet tweet) {
        try {
            // 获取发布者信息
            User publisher = userService.getUser(tweet.getUserId());
            
            // 根据用户类型决定推送策略
            if (publisher.getFollowerCount() <= 1000) {
                // 全量推送
                pushToAllFollowers(tweet);
            } else if (publisher.getFollowerCount() <= 10000) {
                // 只推送给活跃粉丝
                pushToActiveFollowers(tweet);
            } else {
                // 大V不推送，使用拉模式
                log.info("Big V tweet, skip push: {}", tweet.getId());
            }
        } catch (Exception e) {
            log.error("Failed to push tweet: {}", tweet.getId(), e);
            // 发送到死信队列
            sendToDeadLetter(tweet);
        }
    }
    
    private void pushToAllFollowers(Tweet tweet) {
        Set<Long> followers = userService.getFollowers(tweet.getUserId());
        
        // 批量推送
        List<List<Long>> batches = Lists.partition(new ArrayList<>(followers), 1000);
        
        for (List<Long> batch : batches) {
            CompletableFuture.runAsync(() -> {
                redisTemplate.executePipelined((RedisCallback<Object>) connection -> {
                    for (Long followerId : batch) {
                        String key = FEED_KEY_PREFIX + followerId;
                        connection.zAdd(key.getBytes(), 
                            tweet.getCreatedAt().getTime(), 
                            tweet.getId().toString().getBytes());
                    }
                    return null;
                });
            });
        }
    }
}
``` 

## 8. 常见问题和优化方案

### 8.1 性能优化

#### 8.1.1 热点数据处理
**问题**：某些热门微博或大V用户访问量极大，造成缓存击穿

**解决方案**：
1. **多级缓存**：本地缓存 + Redis缓存 + CDN缓存
2. **热点发现**：实时统计访问频率，自动识别热点
3. **缓存预热**：提前加载热点数据到缓存
4. **请求合并**：相同请求合并处理

```java
@Component
public class HotspotManager {
    private final LoadingCache<String, Object> localCache;
    
    public HotspotManager() {
        this.localCache = Caffeine.newBuilder()
            .maximumSize(10000)
            .expireAfterWrite(1, TimeUnit.MINUTES)
            .build(key -> loadFromRedis(key));
    }
    
    public Object get(String key) {
        // 先查本地缓存
        Object value = localCache.get(key);
        if (value != null) {
            return value;
        }
        
        // 使用 singleflight 模式防止缓存击穿
        return singleFlight.execute(key, () -> {
            // 查询 Redis
            Object redisValue = redisTemplate.opsForValue().get(key);
            if (redisValue != null) {
                localCache.put(key, redisValue);
                return redisValue;
            }
            
            // 查询数据库
            Object dbValue = loadFromDatabase(key);
            if (dbValue != null) {
                // 写入缓存，使用随机过期时间防止缓存雪崩
                int ttl = 3600 + new Random().nextInt(600);
                redisTemplate.opsForValue().set(key, dbValue, ttl, TimeUnit.SECONDS);
                localCache.put(key, dbValue);
            }
            
            return dbValue;
        });
    }
}
```

#### 8.1.2 数据库优化
1. **索引优化**：
   - 复合索引：(user_id, created_at) 用于查询用户微博
   - 覆盖索引：避免回表查询
   
2. **查询优化**：
   - 避免 SELECT *
   - 使用 LIMIT 限制返回数据量
   - 批量查询代替循环查询

3. **分库分表**：
   - 垂直分库：用户库、微博库、关系库
   - 水平分表：按 ID 取模分表

### 8.2 可用性保障

#### 8.2.1 服务降级
```java
@Component
public class FeedDegradeService {
    @HystrixCommand(
        fallbackMethod = "getFeedFallback",
        commandProperties = {
            @HystrixProperty(name = "execution.isolation.thread.timeoutInMilliseconds", value = "1000"),
            @HystrixProperty(name = "circuitBreaker.requestVolumeThreshold", value = "20"),
            @HystrixProperty(name = "circuitBreaker.errorThresholdPercentage", value = "50")
        }
    )
    public List<Tweet> getFeed(Long userId, int page, int size) {
        // 正常获取 Feed 流逻辑
        return feedService.getFeed(userId, page, size);
    }
    
    public List<Tweet> getFeedFallback(Long userId, int page, int size) {
        // 降级策略：返回缓存的热门内容
        return hotContentService.getHotTweets(size);
    }
}
```

#### 8.2.2 限流策略
1. **用户级别限流**：每个用户每分钟最多请求60次
2. **IP级别限流**：每个IP每分钟最多请求100次
3. **接口级别限流**：发布接口每分钟最多10次

### 8.3 数据一致性

#### 8.3.1 缓存一致性
**问题**：数据库和缓存数据不一致

**解决方案**：
1. **Cache Aside Pattern**：
   - 读：先读缓存，miss则读DB并写缓存
   - 写：先写DB，再删除缓存

2. **延迟双删**：
```java
public void updateTweet(Tweet tweet) {
    // 1. 删除缓存
    deleteCache(tweet.getId());
    
    // 2. 更新数据库
    tweetMapper.update(tweet);
    
    // 3. 延迟删除缓存（防止并发读写导致的不一致）
    scheduledExecutor.schedule(() -> {
        deleteCache(tweet.getId());
    }, 500, TimeUnit.MILLISECONDS);
}
```

#### 8.3.2 分布式事务
使用 Seata 实现分布式事务：
```java
@GlobalTransactional
public void publishTweet(TweetRequest request) {
    // 1. 保存微博
    Tweet tweet = tweetService.save(request);
    
    // 2. 更新用户计数
    userService.incrementTweetCount(request.getUserId());
    
    // 3. 发送消息
    messageService.sendTweetPublishEvent(tweet);
}
```

### 8.4 扩展性设计

#### 8.4.1 水平扩展
1. **无状态服务**：所有微服务无状态，支持水平扩展
2. **数据分片**：使用一致性哈希进行数据分片
3. **读写分离**：主库写，从库读

#### 8.4.2 垂直扩展
1. **服务拆分**：按业务功能拆分微服务
2. **存储分离**：不同类型数据使用不同存储
3. **异步解耦**：使用消息队列解耦服务

### 8.5 常见面试问题

#### Q1: 如何处理僵尸粉（大量假粉丝）？
**答**：
1. 用户分级，僵尸用户不推送
2. 基于活跃度的推送策略
3. 定期清理不活跃用户的时间线

#### Q2: 如何实现@提醒功能？
**答**：
1. 发布时解析@用户
2. 写入被@用户的提醒列表
3. 推送通知给被@用户

#### Q3: 如何防止缓存雪崩？
**答**：
1. 缓存过期时间加随机值
2. 使用多级缓存
3. 限流和降级保护
4. 缓存预热

#### Q4: 如何优化大V的粉丝列表查询？
**答**：
1. 粉丝列表分页存储
2. 只缓存活跃粉丝
3. 使用 HyperLogLog 统计粉丝数

#### Q5: 如何实现删除微博功能？
**答**：
1. 软删除：标记删除状态
2. 异步清理：从所有粉丝时间线移除
3. 缓存失效：删除相关缓存

## 9. 总结

本系统设计实现了一个支持10万QPS的微博Feed流系统，主要特点：

1. **高性能**：使用缓存、CDN、异步处理等技术
2. **高可用**：服务降级、限流、多副本等保障
3. **可扩展**：微服务架构、分库分表、消息队列
4. **灵活性**：混合模式Feed流，适应不同场景

关键技术选型：
- Spring Cloud 微服务框架
- MySQL + ShardingSphere 分库分表
- Redis 集群缓存
- Kafka 消息队列
- ElasticSearch 搜索引擎

通过合理的架构设计和技术选型，系统能够满足大规模社交网络的需求。 