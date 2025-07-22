# 短URL系统设计

## 1. 需求分析

### 1.1 功能性需求

1. **URL缩短**：将长URL转换为短URL
2. **URL重定向**：通过短URL访问原始长URL
3. **自定义短链**：允许用户自定义短链后缀
4. **URL过期**：支持设置URL过期时间
5. **访问统计**：记录点击次数、访问来源等统计信息
6. **URL管理**：查看、编辑、删除已创建的短链

### 1.2 非功能性需求

1. **高可用性**：系统可用性要求99.9%
2. **高并发**：支持10万QPS的读写请求
3. **低延迟**：URL重定向延迟<100ms
4. **可扩展性**：支持水平扩展
5. **数据一致性**：最终一致性即可
6. **存储容量**：支持1亿个URL记录

## 2. 容量估算

### 2.1 流量估算

- **写请求**：1万QPS（URL生成）
- **读请求**：10万QPS（URL重定向）
- **读写比例**：10:1
- **日均新增URL**：8.64亿个（1万QPS × 86400秒）

### 2.2 存储估算

- **单条记录**：约500字节（包括长URL、短URL、创建时间、统计信息等）
- **5年存储需求**：1万QPS × 86400秒 × 365天 × 5年 × 500字节 ≈ 78TB
- **考虑索引和冗余**：约200TB

### 2.3 带宽估算

- **读请求**：10万QPS × 500字节 ≈ 50MB/s
- **写请求**：1万QPS × 500字节 ≈ 5MB/s
- **总带宽需求**：约55MB/s

## 3. 系统接口设计

### 3.1 核心API

```java
// URL生成接口
POST /api/v1/urls
{
    "originalUrl": "https://example.com/very/long/url",
    "customAlias": "custom123", // 可选
    "expireTime": "2024-12-31T23:59:59Z" // 可选
}

// 响应
{
    "shortUrl": "https://short.ly/abc123",
    "originalUrl": "https://example.com/very/long/url",
    "shortCode": "abc123",
    "createdAt": "2024-01-01T00:00:00Z",
    "expireTime": "2024-12-31T23:59:59Z"
}

// URL重定向接口
GET /{shortCode}
// 302重定向到原始URL

// 获取URL信息
GET /api/v1/urls/{shortCode}
{
    "shortUrl": "https://short.ly/abc123",
    "originalUrl": "https://example.com/very/long/url",
    "clickCount": 1234,
    "createdAt": "2024-01-01T00:00:00Z",
    "expireTime": "2024-12-31T23:59:59Z",
    "lastAccessTime": "2024-01-10T10:30:00Z"
}

// 获取统计信息
GET /api/v1/urls/{shortCode}/analytics
{
    "totalClicks": 1234,
    "dailyClicks": [...],
    "referrers": {...},
    "locations": {...},
    "devices": {...}
}
```

## 4. 数据库设计

### 4.1 核心表结构

```sql
-- URL映射表
CREATE TABLE url_mappings (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    short_code VARCHAR(10) NOT NULL UNIQUE,
    original_url TEXT NOT NULL,
    custom_alias VARCHAR(50),
    user_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expire_time TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    click_count BIGINT DEFAULT 0,
    last_access_time TIMESTAMP NULL,
    INDEX idx_short_code (short_code),
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
);

-- 访问统计表
CREATE TABLE url_analytics (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    short_code VARCHAR(10) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    referrer TEXT,
    country VARCHAR(2),
    city VARCHAR(100),
    access_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_short_code_time (short_code, access_time),
    INDEX idx_access_time (access_time)
);

-- 用户表
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);
```

### 4.2 分片策略

基于短码进行分片：
- 使用短码的哈希值进行分片
- 16个分片，每个分片处理约6250QPS
- 分片键：`hash(short_code) % 16`

## 5. 短码生成算法

### 5.1 Base62编码

```java
public class ShortCodeGenerator {
    private static final String BASE62 = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final int BASE = 62;
    private static final int SHORT_CODE_LENGTH = 7; // 62^7 ≈ 3.5万亿

    // 计数器+Base62编码
    public String generateShortCode(long counter) {
        StringBuilder result = new StringBuilder();
        while (counter > 0) {
            result.append(BASE62.charAt((int) (counter % BASE)));
            counter /= BASE;
        }
        
        // 补齐到7位
        while (result.length() < SHORT_CODE_LENGTH) {
            result.append(BASE62.charAt(0));
        }
        
        return result.reverse().toString();
    }
    
    // 哈希+Base62编码（备选方案）
    public String generateFromHash(String originalUrl) {
        long hash = MurmurHash.hash64(originalUrl.getBytes());
        return generateShortCode(Math.abs(hash));
    }
}
```

### 5.2 分布式ID生成

使用雪花算法生成唯一ID，然后转换为Base62：

```java
@Component
public class DistributedIdGenerator {
    private final SnowflakeIdWorker snowflake;
    
    public DistributedIdGenerator(@Value("${worker.id}") long workerId,
                                 @Value("${datacenter.id}") long datacenterId) {
        this.snowflake = new SnowflakeIdWorker(workerId, datacenterId);
    }
    
    public String generateShortCode() {
        long id = snowflake.nextId();
        return ShortCodeGenerator.generateShortCode(id);
    }
}
```

## 6. 系统架构设计

### 6.1 整体架构

```
                    [负载均衡器]
                         |
              [API网关 / CDN]
                         |
           +-------------+-------------+
           |                           |
    [URL生成服务]                 [URL重定向服务]
           |                           |
           |                           |
    +------+------+             +-----+-----+
    |             |             |           |
[Master数据库]  [缓存层]       [只读副本]  [缓存层]
    |             |             |           |
[分析服务]    [Redis集群]    [MySQL集群] [Redis集群]
```

### 6.2 核心组件

1. **API网关**：请求路由、限流、认证
2. **URL生成服务**：处理短链生成请求
3. **URL重定向服务**：处理重定向请求
4. **缓存层**：Redis集群，缓存热点数据
5. **数据库层**：MySQL主从集群
6. **分析服务**：异步处理统计数据

### 6.3 技术栈选择

- **Web框架**：Spring Boot + Spring Cloud
- **数据库**：MySQL 8.0（主从复制 + 分片）
- **缓存**：Redis Cluster
- **消息队列**：Apache Kafka
- **负载均衡**：Nginx + Spring Cloud Gateway
- **监控**：Micrometer + Prometheus

## 7. 详细设计

### 7.1 URL生成服务

```java
@RestController
@RequestMapping("/api/v1/urls")
public class UrlController {
    
    @Autowired
    private UrlService urlService;
    
    @PostMapping
    public ResponseEntity<UrlResponse> createShortUrl(@RequestBody CreateUrlRequest request) {
        try {
            UrlMapping mapping = urlService.createShortUrl(request);
            return ResponseEntity.ok(toResponse(mapping));
        } catch (CustomAliasExistsException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Custom alias already exists"));
        }
    }
}

@Service
public class UrlService {
    
    @Autowired
    private UrlRepository urlRepository;
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    @Autowired
    private DistributedIdGenerator idGenerator;
    
    @Transactional
    public UrlMapping createShortUrl(CreateUrlRequest request) {
        String shortCode;
        
        if (StringUtils.hasText(request.getCustomAlias())) {
            // 检查自定义别名是否存在
            if (urlRepository.existsByShortCode(request.getCustomAlias())) {
                throw new CustomAliasExistsException();
            }
            shortCode = request.getCustomAlias();
        } else {
            // 生成短码
            shortCode = idGenerator.generateShortCode();
            // 防止碰撞
            while (urlRepository.existsByShortCode(shortCode)) {
                shortCode = idGenerator.generateShortCode();
            }
        }
        
        UrlMapping mapping = new UrlMapping();
        mapping.setShortCode(shortCode);
        mapping.setOriginalUrl(request.getOriginalUrl());
        mapping.setExpireTime(request.getExpireTime());
        mapping.setUserId(request.getUserId());
        
        UrlMapping saved = urlRepository.save(mapping);
        
        // 缓存到Redis
        cacheUrlMapping(saved);
        
        return saved;
    }
    
    private void cacheUrlMapping(UrlMapping mapping) {
        String key = "url:" + mapping.getShortCode();
        redisTemplate.opsForValue().set(key, mapping, Duration.ofHours(24));
    }
}
```

### 7.2 URL重定向服务

```java
@Controller
public class RedirectController {
    
    @Autowired
    private UrlService urlService;
    @Autowired
    private AnalyticsService analyticsService;
    
    @GetMapping("/{shortCode}")
    public ResponseEntity<Void> redirect(@PathVariable String shortCode,
                                       HttpServletRequest request) {
        try {
            UrlMapping mapping = urlService.getUrlMapping(shortCode);
            
            if (mapping == null || !mapping.isActive()) {
                return ResponseEntity.notFound().build();
            }
            
            if (mapping.getExpireTime() != null && 
                mapping.getExpireTime().isBefore(Instant.now())) {
                return ResponseEntity.notFound().build();
            }
            
            // 异步更新统计信息
            analyticsService.recordAccess(shortCode, request);
            
            // 重定向
            HttpHeaders headers = new HttpHeaders();
            headers.setLocation(URI.create(mapping.getOriginalUrl()));
            return new ResponseEntity<>(headers, HttpStatus.FOUND);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}

@Service
public class UrlService {
    
    public UrlMapping getUrlMapping(String shortCode) {
        // 先从缓存获取
        String key = "url:" + shortCode;
        UrlMapping cached = (UrlMapping) redisTemplate.opsForValue().get(key);
        if (cached != null) {
            return cached;
        }
        
        // 缓存未命中，从数据库查询
        Optional<UrlMapping> mapping = urlRepository.findByShortCode(shortCode);
        if (mapping.isPresent()) {
            // 写入缓存
            cacheUrlMapping(mapping.get());
            return mapping.get();
        }
        
        return null;
    }
}
```

### 7.3 分析服务

```java
@Service
public class AnalyticsService {
    
    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;
    
    @Async
    public void recordAccess(String shortCode, HttpServletRequest request) {
        AccessEvent event = new AccessEvent();
        event.setShortCode(shortCode);
        event.setIpAddress(getClientIpAddress(request));
        event.setUserAgent(request.getHeader("User-Agent"));
        event.setReferrer(request.getHeader("Referer"));
        event.setAccessTime(Instant.now());
        
        // 发送到Kafka
        kafkaTemplate.send("url-access-events", shortCode, event);
    }
    
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (StringUtils.hasText(xForwardedFor)) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}

@KafkaListener(topics = "url-access-events")
@Component
public class AccessEventProcessor {
    
    @Autowired
    private UrlRepository urlRepository;
    @Autowired
    private AnalyticsRepository analyticsRepository;
    
    public void processAccessEvent(AccessEvent event) {
        // 更新点击计数
        urlRepository.incrementClickCount(event.getShortCode());
        
        // 保存详细分析数据
        UrlAnalytics analytics = new UrlAnalytics();
        analytics.setShortCode(event.getShortCode());
        analytics.setIpAddress(event.getIpAddress());
        analytics.setUserAgent(event.getUserAgent());
        analytics.setReferrer(event.getReferrer());
        analytics.setAccessTime(event.getAccessTime());
        
        // 解析地理位置信息
        LocationInfo location = geoLocationService.getLocation(event.getIpAddress());
        analytics.setCountry(location.getCountry());
        analytics.setCity(location.getCity());
        
        analyticsRepository.save(analytics);
    }
}
```

## 8. 缓存策略

### 8.1 多级缓存

1. **本地缓存**：Caffeine，缓存热点数据
2. **分布式缓存**：Redis Cluster，缓存URL映射
3. **CDN缓存**：缓存静态资源和重定向响应

### 8.2 缓存配置

```java
@Configuration
@EnableCaching
public class CacheConfig {
    
    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager manager = new CaffeineCacheManager();
        manager.setCaffeine(Caffeine.newBuilder()
            .maximumSize(10000)
            .expireAfterWrite(Duration.ofMinutes(10))
            .recordStats());
        return manager;
    }
    
    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory factory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(factory);
        template.setKeySerializer(new StringRedisSerializer());
        template.setValueSerializer(new GenericJackson2JsonRedisSerializer());
        return template;
    }
}
```

## 9. 扩展性考虑

### 9.1 水平扩展

1. **无状态服务**：所有服务都是无状态的，支持水平扩展
2. **数据库分片**：按短码哈希进行分片
3. **缓存集群**：Redis Cluster支持水平扩展
4. **负载均衡**：使用一致性哈希算法

### 9.2 读写分离

```java
@Configuration
public class DatabaseConfig {
    
    @Bean
    @Primary
    public DataSource writeDataSource() {
        // 主数据库配置
        return DataSourceBuilder.create()
            .url("jdbc:mysql://master:3306/shorturl")
            .build();
    }
    
    @Bean
    public DataSource readDataSource() {
        // 从数据库配置
        return DataSourceBuilder.create()
            .url("jdbc:mysql://slave:3306/shorturl")
            .build();
    }
    
    @Bean
    public DataSource routingDataSource() {
        RoutingDataSource dataSource = new RoutingDataSource();
        Map<Object, Object> targetDataSources = new HashMap<>();
        targetDataSources.put("write", writeDataSource());
        targetDataSources.put("read", readDataSource());
        dataSource.setTargetDataSources(targetDataSources);
        dataSource.setDefaultTargetDataSource(writeDataSource());
        return dataSource;
    }
}
```

## 10. 常见问题和优化方案

### 10.1 Q: 如何处理短码碰撞？

**A: 多重防护策略**
1. 使用64位雪花算法生成ID，碰撞概率极低
2. 数据库唯一索引防止重复
3. 生成时检查重复，重新生成

### 10.2 Q: 如何处理热点数据？

**A: 多级缓存**
```java
@Service
public class HotDataService {
    
    @Autowired
    private BloomFilter<String> bloomFilter;
    
    public UrlMapping getUrlMapping(String shortCode) {
        // 1. 布隆过滤器快速判断
        if (!bloomFilter.mightContain(shortCode)) {
            return null;
        }
        
        // 2. 本地缓存
        UrlMapping local = localCache.get(shortCode);
        if (local != null) {
            return local;
        }
        
        // 3. Redis缓存
        UrlMapping redis = redisTemplate.opsForValue().get("url:" + shortCode);
        if (redis != null) {
            localCache.put(shortCode, redis);
            return redis;
        }
        
        // 4. 数据库查询
        UrlMapping db = urlRepository.findByShortCode(shortCode).orElse(null);
        if (db != null) {
            redisTemplate.opsForValue().set("url:" + shortCode, db, Duration.ofHours(24));
            localCache.put(shortCode, db);
        }
        
        return db;
    }
}
```

### 10.3 Q: 如何处理缓存穿透？

**A: 布隆过滤器 + 空值缓存**
```java
@Component
public class BloomFilterConfig {
    
    @Bean
    public BloomFilter<String> shortCodeBloomFilter() {
        // 预期1亿个元素，1%误判率
        return BloomFilter.create(
            Funnels.stringFunnel(Charset.defaultCharset()),
            100_000_000,
            0.01
        );
    }
    
    @PostConstruct
    public void initBloomFilter() {
        // 启动时加载所有短码到布隆过滤器
        List<String> shortCodes = urlRepository.findAllShortCodes();
        shortCodes.forEach(bloomFilter::put);
    }
}
```

### 10.4 Q: 如何处理数据库写压力？

**A: 异步写入 + 批量处理**
```java
@Service
public class AsyncWriteService {
    
    private final Queue<UrlMapping> writeQueue = new LinkedBlockingQueue<>();
    
    @Scheduled(fixedDelay = 1000) // 每秒批量写入
    public void batchWrite() {
        List<UrlMapping> batch = new ArrayList<>();
        UrlMapping mapping;
        while ((mapping = writeQueue.poll()) != null && batch.size() < 1000) {
            batch.add(mapping);
        }
        
        if (!batch.isEmpty()) {
            urlRepository.saveAll(batch);
        }
    }
    
    public void asyncSave(UrlMapping mapping) {
        writeQueue.offer(mapping);
    }
}
```

### 10.5 Q: 如何提高重定向性能？

**A: 多重优化**
1. **CDN缓存**：将重定向响应缓存到CDN
2. **HTTP缓存头**：设置适当的缓存头
3. **连接池优化**：优化数据库和Redis连接池
4. **异步处理**：统计数据异步处理

```java
@GetMapping("/{shortCode}")
public ResponseEntity<Void> redirect(@PathVariable String shortCode) {
    UrlMapping mapping = urlService.getUrlMapping(shortCode);
    
    HttpHeaders headers = new HttpHeaders();
    headers.setLocation(URI.create(mapping.getOriginalUrl()));
    
    // 设置缓存头
    headers.setCacheControl(CacheControl.maxAge(Duration.ofMinutes(10)));
    headers.setExpires(Instant.now().plus(Duration.ofMinutes(10)));
    
    return new ResponseEntity<>(headers, HttpStatus.MOVED_PERMANENTLY);
}
```

### 10.6 Q: 如何保证系统高可用？

**A: 多重保障**
1. **服务冗余**：多实例部署
2. **数据库主从**：主从复制 + 故障转移
3. **缓存集群**：Redis Cluster
4. **熔断器**：防止级联故障
5. **限流器**：防止系统过载

```java
@Component
public class CircuitBreakerConfig {
    
    @Bean
    public CircuitBreaker databaseCircuitBreaker() {
        return CircuitBreaker.ofDefaults("database");
    }
    
    public UrlMapping getUrlMappingWithCircuitBreaker(String shortCode) {
        Supplier<UrlMapping> supplier = CircuitBreaker
            .decorateSupplier(databaseCircuitBreaker(), 
                () -> urlRepository.findByShortCode(shortCode).orElse(null));
        
        return Try.ofSupplier(supplier)
            .recover(throwable -> {
                // 降级策略：返回缓存数据或默认页面
                return getCachedUrlMapping(shortCode);
            })
            .get();
    }
}
```

### 10.7 Q: 如何处理恶意请求？

**A: 多维度限流**
```java
@Component
public class RateLimitService {
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    public boolean isAllowed(String identifier, int limit, Duration window) {
        String key = "rate_limit:" + identifier;
        String script = 
            "local current = redis.call('GET', KEYS[1]) " +
            "if current == false then " +
            "  redis.call('SET', KEYS[1], 1) " +
            "  redis.call('EXPIRE', KEYS[1], ARGV[2]) " +
            "  return 1 " +
            "else " +
            "  local count = redis.call('INCR', KEYS[1]) " +
            "  if count > tonumber(ARGV[1]) then " +
            "    return 0 " +
            "  else " +
            "    return 1 " +
            "  end " +
            "end";
        
        Long result = redisTemplate.execute(
            RedisScript.of(script, Long.class),
            Collections.singletonList(key),
            limit,
            window.getSeconds()
        );
        
        return result != null && result == 1;
    }
}
```

## 11. 监控和告警

### 11.1 关键指标

1. **QPS监控**：请求量、响应时间
2. **错误率监控**：4xx、5xx错误率
3. **缓存命中率**：Redis和本地缓存命中率
4. **数据库性能**：连接数、慢查询
5. **系统资源**：CPU、内存、磁盘使用率

### 11.2 监控配置

```java
@Component
public class MetricsConfig {
    
    @Autowired
    private MeterRegistry meterRegistry;
    
    @EventListener
    public void handleUrlCreated(UrlCreatedEvent event) {
        Counter.builder("url.created")
            .tag("source", event.getSource())
            .register(meterRegistry)
            .increment();
    }
    
    @EventListener
    public void handleUrlAccessed(UrlAccessedEvent event) {
        Timer.Sample sample = Timer.start(meterRegistry);
        sample.stop(Timer.builder("url.redirect.time")
            .register(meterRegistry));
    }
}
```

## 12. 总结

这个短URL系统设计考虑了以下关键要素：

1. **高并发处理**：通过多级缓存、读写分离、异步处理支持10万QPS
2. **高可用性**：服务冗余、数据库主从、熔断器保证99.9%可用性
3. **可扩展性**：无状态服务、数据库分片、缓存集群支持水平扩展
4. **数据一致性**：最终一致性模型，平衡性能和一致性
5. **监控告警**：全方位监控，及时发现和处理问题

通过合理的架构设计和技术选型，该系统能够满足大规模互联网应用的需求。 