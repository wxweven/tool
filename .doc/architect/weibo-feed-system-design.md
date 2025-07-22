# 微博Feed流系统设计

## 1. 需求分析

### 1.1 功能性需求

#### 核心功能
- **用户管理**：用户注册、登录、个人资料管理
- **发布微博**：支持文本、图片、视频等多媒体内容
- **关注/粉丝**：用户可以关注其他用户，建立社交关系
- **Feed流**：用户可以查看关注用户的微博内容
- **互动功能**：点赞、评论、转发、私信
- **搜索功能**：支持用户、微博内容搜索
- **推荐系统**：智能推荐用户和内容

#### 高级功能
- **热门话题**：话题标签、热搜榜
- **实时通知**：点赞、评论、关注等实时通知
- **内容审核**：敏感内容过滤和人工审核
- **数据分析**：用户行为分析、内容传播分析

### 1.2 非功能性需求

#### 性能指标
- **用户规模**：支持1亿+注册用户，日活跃用户5000万
- **并发量**：峰值QPS 100万+
- **延迟要求**：Feed流加载时间 < 200ms
- **可用性**：99.9%以上
- **数据一致性**：最终一致性

#### 扩展性要求
- **水平扩展**：支持服务和数据库的水平扩展
- **全球化部署**：支持多地域部署
- **流量弹性**：应对突发流量增长

## 2. 系统容量估算

### 2.1 用户和内容规模
- **注册用户**：1亿
- **日活跃用户**：5000万
- **每日新增微博**：1000万条
- **平均关注数**：100人
- **平均粉丝数**：100人

### 2.2 存储需求
- **微博内容**：每条平均1KB，年增长约3.6TB
- **用户数据**：每用户平均10KB，总计约1TB
- **关系数据**：100亿关系对，约400GB
- **多媒体文件**：每日约10TB新增

### 2.3 带宽和QPS估算
- **读QPS**：峰值100万/秒
- **写QPS**：峰值10万/秒
- **带宽需求**：出口带宽100Gbps+

## 3. 核心架构设计

### 3.1 整体架构图

```
                    [CDN]
                      |
                [Load Balancer]
                      |
            [API Gateway/Nginx]
                      |
    ┌─────────────────┼─────────────────┐
    │                 │                 │
[用户服务]        [微博服务]         [Feed服务]
    │                 │                 │
    ├─────────────────┼─────────────────┤
    │                 │                 │
[关注服务]        [互动服务]         [推荐服务]
    │                 │                 │
    └─────────────────┼─────────────────┘
                      │
         ┌────────────┼────────────┐
         │            │            │
    [Redis集群]   [MySQL集群]   [Elasticsearch]
         │            │            │
    [消息队列]    [文件存储]    [监控系统]
```

### 3.2 微服务拆分

#### 用户服务 (User Service)
- **职责**：用户注册、登录、个人资料管理
- **技术栈**：Spring Boot + MySQL + Redis
- **接口**：用户CRUD、认证授权

#### 微博服务 (Post Service)
- **职责**：微博发布、编辑、删除、查询
- **技术栈**：Spring Boot + MySQL + Redis + OSS
- **接口**：微博CRUD、多媒体处理

#### 关注服务 (Follow Service)
- **职责**：关注关系管理、粉丝列表
- **技术栈**：Spring Boot + MySQL + Redis
- **接口**：关注/取消关注、关系查询

#### Feed服务 (Feed Service)
- **职责**：Feed流生成、个性化推荐
- **技术栈**：Spring Boot + Redis + Kafka
- **接口**：时间线生成、Feed推送

#### 互动服务 (Interaction Service)
- **职责**：点赞、评论、转发、收藏
- **技术栈**：Spring Boot + MySQL + Redis
- **接口**：互动行为记录和查询

#### 通知服务 (Notification Service)
- **职责**：实时通知推送
- **技术栈**：Spring Boot + WebSocket + Redis + Kafka
- **接口**：通知推送、消息管理

## 4. 数据库设计

### 4.1 用户表 (users)
```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nickname VARCHAR(100),
    avatar_url VARCHAR(500),
    bio TEXT,
    verified BOOLEAN DEFAULT FALSE,
    follower_count INT DEFAULT 0,
    following_count INT DEFAULT 0,
    post_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email)
);
```

### 4.2 微博表 (posts)
```sql
CREATE TABLE posts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    media_urls JSON,
    post_type ENUM('text', 'image', 'video', 'repost') DEFAULT 'text',
    repost_id BIGINT,
    like_count INT DEFAULT 0,
    comment_count INT DEFAULT 0,
    repost_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### 4.3 关注关系表 (follows)
```sql
CREATE TABLE follows (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    follower_id BIGINT NOT NULL,
    followee_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_follow (follower_id, followee_id),
    INDEX idx_follower (follower_id),
    INDEX idx_followee (followee_id),
    FOREIGN KEY (follower_id) REFERENCES users(id),
    FOREIGN KEY (followee_id) REFERENCES users(id)
);
```

### 4.4 互动表 (interactions)
```sql
CREATE TABLE interactions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    post_id BIGINT NOT NULL,
    interaction_type ENUM('like', 'comment', 'repost') NOT NULL,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_post (user_id, post_id),
    INDEX idx_post_type (post_id, interaction_type),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (post_id) REFERENCES posts(id)
);
```

## 5. Feed流生成策略

### 5.1 推拉结合模式

#### Push模式（推模式）
- **适用场景**：粉丝数较少的用户（< 10万粉丝）
- **实现方式**：用户发布微博时，主动推送到所有粉丝的Feed缓存
- **优点**：读取速度快，用户体验好
- **缺点**：存储成本高，写入成本高

#### Pull模式（拉模式）
- **适用场景**：大V用户（粉丝数 > 10万）
- **实现方式**：用户刷新Feed时，实时从关注用户的微博中拉取
- **优点**：存储成本低，数据一致性好
- **缺点**：读取延迟较高

#### 混合模式
```java
@Service
public class FeedService {
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private PostService postService;
    
    @Autowired
    private RedisTemplate redisTemplate;
    
    /**
     * 生成用户Feed流
     */
    public List<Post> generateFeed(Long userId, int page, int size) {
        List<Long> followingIds = userService.getFollowingIds(userId);
        
        // 分离大V和普通用户
        Map<Boolean, List<Long>> partitioned = followingIds.stream()
            .collect(Collectors.partitioningBy(this::isBigV));
        
        List<Long> normalUsers = partitioned.get(false);
        List<Long> bigVUsers = partitioned.get(true);
        
        // 从缓存获取普通用户的推送内容
        List<Post> pushedPosts = getPushedPosts(normalUsers, page, size);
        
        // 实时拉取大V用户的内容
        List<Post> pulledPosts = pullPostsFromBigV(bigVUsers, page, size);
        
        // 合并并排序
        return mergeAndSort(pushedPosts, pulledPosts, size);
    }
    
    /**
     * 判断是否为大V
     */
    private boolean isBigV(Long userId) {
        User user = userService.getUser(userId);
        return user.getFollowerCount() > 100000;
    }
}
```

### 5.2 Feed缓存设计

#### Redis数据结构
```
# 用户Feed流 - 有序集合存储
feed:user:{userId} -> ZSET {postId: timestamp}

# 微博详情缓存
post:{postId} -> HASH {content, user_id, created_at, ...}

# 用户关注列表缓存
following:{userId} -> SET {followingUserId1, followingUserId2, ...}
```

#### Feed更新策略
```java
@Component
public class FeedUpdater {
    
    @EventListener
    public void onPostCreated(PostCreatedEvent event) {
        Post post = event.getPost();
        Long authorId = post.getUserId();
        
        if (isBigV(authorId)) {
            // 大V发布：仅缓存热门粉丝的Feed
            updateHotFollowersFeed(authorId, post);
        } else {
            // 普通用户发布：推送到所有粉丝Feed
            updateAllFollowersFeed(authorId, post);
        }
    }
    
    private void updateAllFollowersFeed(Long authorId, Post post) {
        List<Long> followers = userService.getFollowerIds(authorId);
        
        // 批量更新Feed缓存
        followers.parallelStream().forEach(followerId -> {
            String feedKey = "feed:user:" + followerId;
            redisTemplate.opsForZSet().add(feedKey, post.getId(), post.getCreatedAt().getTime());
            // 保持Feed大小限制，移除过旧内容
            redisTemplate.opsForZSet().removeRange(feedKey, 0, -1001);
        });
    }
}
```

## 6. 技术栈选择

### 6.1 后端技术栈

#### 框架和库
- **Java 17** + **Spring Boot 3.x**：核心开发框架
- **Spring Cloud Gateway**：API网关
- **Spring Security + JWT**：认证授权
- **Spring Data JPA**：数据访问层
- **MyBatis-Plus**：数据库操作增强

#### 数据存储
- **MySQL 8.0**：主数据库（用户、微博、关系数据）
- **Redis 7.0**：缓存和会话存储
- **Elasticsearch 8.x**：搜索和分析
- **MongoDB**：非结构化数据存储

#### 中间件
- **Apache Kafka**：消息队列（异步处理、事件驱动）
- **Apache RocketMQ**：实时消息推送
- **Nginx**：负载均衡和反向代理
- **Consul**：服务注册与发现

#### 存储和CDN
- **阿里云OSS/AWS S3**：文件存储
- **阿里云CDN/CloudFlare**：内容分发

### 6.2 监控和运维
- **Prometheus + Grafana**：监控和告警
- **ELK Stack**：日志收集和分析
- **Docker + Kubernetes**：容器化部署
- **Jenkins**：CI/CD流水线

## 7. 系统优化策略

### 7.1 缓存策略

#### 多级缓存架构
```
用户请求 -> Nginx缓存 -> Redis缓存 -> 数据库
```

#### 缓存类型
- **页面缓存**：首页、用户主页等静态内容
- **对象缓存**：用户信息、微博详情
- **查询缓存**：复杂查询结果
- **计数缓存**：点赞数、评论数、转发数

#### 缓存更新策略
```java
@Service
public class CacheService {
    
    /**
     * 缓存更新策略：先更新数据库，再删除缓存
     */
    @Transactional
    public void updatePost(Post post) {
        // 1. 更新数据库
        postRepository.save(post);
        
        // 2. 删除相关缓存
        redisTemplate.delete("post:" + post.getId());
        redisTemplate.delete("user:posts:" + post.getUserId());
        
        // 3. 异步更新Feed缓存
        kafkaTemplate.send("feed.update", new FeedUpdateEvent(post));
    }
}
```

### 7.2 数据库优化

#### 分库分表策略
```sql
-- 用户表按ID分片
users_0, users_1, users_2, users_3

-- 微博表按用户ID分片
posts_0, posts_1, posts_2, posts_3

-- 关注关系表按follower_id分片
follows_0, follows_1, follows_2, follows_3
```

#### 读写分离
```java
@Configuration
public class DatabaseConfig {
    
    @Bean
    @Primary
    public DataSource masterDataSource() {
        // 主库配置（写操作）
        return DataSourceBuilder.create()
            .url("jdbc:mysql://master.db:3306/weibo")
            .build();
    }
    
    @Bean
    public DataSource slaveDataSource() {
        // 从库配置（读操作）
        return DataSourceBuilder.create()
            .url("jdbc:mysql://slave.db:3306/weibo")
            .build();
    }
}
```

### 7.3 性能优化

#### 异步处理
```java
@Service
public class AsyncPostService {
    
    @Async("taskExecutor")
    public CompletableFuture<Void> processPostInteraction(Long postId, InteractionType type) {
        // 异步处理点赞、评论等操作
        updateInteractionCount(postId, type);
        sendNotification(postId, type);
        updateRecommendationModel(postId, type);
        return CompletableFuture.completedFuture(null);
    }
}
```

#### 批处理优化
```java
@Component
public class BatchProcessor {
    
    @Scheduled(fixedDelay = 5000)
    public void batchUpdateCounts() {
        // 批量更新点赞、评论、转发计数
        List<CountUpdate> updates = redisTemplate.opsForList()
            .range("count.updates", 0, 999);
        
        if (!updates.isEmpty()) {
            batchUpdateDatabase(updates);
            redisTemplate.opsForList().trim("count.updates", updates.size(), -1);
        }
    }
}
```

## 8. 高可用设计

### 8.1 服务容错

#### 熔断器模式
```java
@Component
public class UserServiceClient {
    
    @HystrixCommand(
        fallbackMethod = "getUserFallback",
        commandProperties = {
            @HystrixProperty(name = "execution.isolation.thread.timeoutInMilliseconds", value = "3000"),
            @HystrixProperty(name = "circuitBreaker.requestVolumeThreshold", value = "10")
        }
    )
    public User getUser(Long userId) {
        return restTemplate.getForObject("/users/" + userId, User.class);
    }
    
    public User getUserFallback(Long userId) {
        // 降级处理：返回默认用户信息
        return new User(userId, "用户暂时无法访问", "");
    }
}
```

#### 限流策略
```java
@RestController
public class FeedController {
    
    @RateLimiter(name = "feedService", fallbackMethod = "getFeedFallback")
    @GetMapping("/feed")
    public ResponseEntity<List<Post>> getFeed(@RequestParam Long userId) {
        List<Post> feed = feedService.generateFeed(userId, 0, 20);
        return ResponseEntity.ok(feed);
    }
    
    public ResponseEntity<List<Post>> getFeedFallback(Long userId, Exception ex) {
        // 降级处理：返回缓存的热门内容
        return ResponseEntity.ok(feedService.getHotFeed());
    }
}
```

### 8.2 数据容灾

#### 主从复制和故障切换
```yaml
# MySQL配置
mysql:
  master:
    host: mysql-master
    port: 3306
  slaves:
    - host: mysql-slave1
      port: 3306
    - host: mysql-slave2
      port: 3306
  failover:
    enabled: true
    timeout: 5s
```

#### 数据备份策略
- **全量备份**：每日凌晨执行
- **增量备份**：每4小时执行
- **跨地域备份**：数据异地存储
- **恢复演练**：定期进行灾难恢复演练

## 9. 安全设计

### 9.1 认证授权

#### JWT Token设计
```java
@Service
public class AuthService {
    
    public String generateToken(User user) {
        return Jwts.builder()
            .setSubject(user.getId().toString())
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + 7 * 24 * 60 * 60 * 1000))
            .signWith(SignatureAlgorithm.HS512, jwtSecret)
            .compact();
    }
    
    @PreAuthorize("hasRole('USER')")
    public void createPost(PostCreateRequest request) {
        // 创建微博
    }
}
```

### 9.2 内容安全

#### 敏感词过滤
```java
@Component
public class ContentModerationService {
    
    private final DFAFilter sensitiveWordFilter;
    
    public ModerationResult moderateContent(String content) {
        // 1. 敏感词检测
        if (sensitiveWordFilter.contains(content)) {
            return ModerationResult.rejected("包含敏感词");
        }
        
        // 2. 机器学习内容分类
        ContentCategory category = mlService.classify(content);
        if (category.getRisk() > 0.8) {
            return ModerationResult.needsManualReview("需要人工审核");
        }
        
        return ModerationResult.approved();
    }
}
```

### 9.3 接口安全

#### API限流和防护
```java
@RestController
@RequestMapping("/api/v1")
public class PostController {
    
    @PostMapping("/posts")
    @RateLimiter(name = "createPost", fallbackMethod = "createPostFallback")
    public ResponseEntity<Post> createPost(@Valid @RequestBody PostCreateRequest request) {
        // 防止XSS攻击
        String sanitizedContent = htmlSanitizer.sanitize(request.getContent());
        
        Post post = postService.createPost(sanitizedContent, getCurrentUserId());
        return ResponseEntity.ok(post);
    }
}
```

## 10. 监控和运维

### 10.1 监控指标

#### 业务指标
- **用户活跃度**：DAU、MAU、留存率
- **内容指标**：发布量、互动率、传播度
- **系统性能**：响应时间、吞吐量、错误率

#### 技术指标
```java
@Component
public class MetricsCollector {
    
    private final MeterRegistry meterRegistry;
    
    @EventListener
    public void onPostCreated(PostCreatedEvent event) {
        // 记录微博发布数量
        meterRegistry.counter("posts.created",
            Tags.of("user_type", event.getPost().getUserType())).increment();
    }
    
    @Timed(name = "feed.generation.time")
    public List<Post> generateFeed(Long userId) {
        return feedService.generateFeed(userId);
    }
}
```

### 10.2 告警机制

#### 关键指标告警
```yaml
# Prometheus告警规则
groups:
- name: weibo.rules
  rules:
  - alert: HighErrorRate
    expr: sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m])) > 0.01
    for: 2m
    annotations:
      summary: "系统错误率过高"
      
  - alert: DatabaseSlowQuery
    expr: mysql_global_status_slow_queries > 100
    for: 1m
    annotations:
      summary: "数据库慢查询过多"
```

## 11. 部署架构

### 11.1 容器化部署

#### Docker配置
```dockerfile
FROM openjdk:17-jre-slim

COPY target/weibo-service.jar app.jar
COPY application.yml application.yml

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app.jar"]
```

#### Kubernetes部署
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: weibo-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: weibo-service
  template:
    metadata:
      labels:
        app: weibo-service
    spec:
      containers:
      - name: weibo-service
        image: weibo/service:latest
        ports:
        - containerPort: 8080
        env:
        - name: SPRING_PROFILES_ACTIVE
          value: "prod"
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
```

### 11.2 多地域部署

#### 地域分布策略
- **华北地域**：北京、天津用户
- **华东地域**：上海、江苏、浙江用户  
- **华南地域**：广东、深圳用户
- **海外地域**：国际用户

#### 数据同步策略
```java
@Component
public class CrossRegionSyncService {
    
    @EventListener
    @Async
    public void syncUserData(UserUpdateEvent event) {
        // 跨地域用户数据同步
        List<Region> otherRegions = getOtherRegions();
        
        otherRegions.parallelStream().forEach(region -> {
            try {
                syncToRegion(region, event.getUser());
            } catch (Exception e) {
                // 记录同步失败，后续重试
                logSyncFailure(region, event);
            }
        });
    }
}
```

## 12. 总结

本微博Feed流系统设计采用了微服务架构，通过推拉结合的Feed生成策略、多级缓存、数据库分片等技术手段，能够支持亿级用户规模和百万级并发访问。

### 关键设计亮点

1. **弹性架构**：采用微服务和容器化部署，支持水平扩展
2. **高性能**：多级缓存 + 异步处理 + 批量操作
3. **高可用**：熔断降级 + 主从切换 + 多地域部署
4. **可扩展**：模块化设计，支持功能快速迭代

### 技术选型优势

- **Java生态成熟**：Spring Boot生态丰富，开发效率高
- **中间件成熟**：Redis、Kafka、MySQL等久经考验
- **运维友好**：容器化部署，监控告警完善

这套架构能够很好地应对微博系统的复杂业务场景和高并发挑战，同时保持了良好的可维护性和扩展性。 