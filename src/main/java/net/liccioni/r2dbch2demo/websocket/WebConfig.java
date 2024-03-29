package net.liccioni.r2dbch2demo.websocket;

import java.time.Duration;
import java.time.temporal.ChronoUnit;
import java.util.Map;

import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.r2dbc.core.R2dbcEntityOperations;
import org.springframework.web.reactive.HandlerMapping;
import org.springframework.web.reactive.handler.SimpleUrlHandlerMapping;
import org.springframework.web.reactive.socket.WebSocketHandler;

import net.datafaker.Faker;
import net.liccioni.r2dbch2demo.model.Product;
import reactor.core.publisher.Flux;

@Configuration
class WebConfig
{
    @Bean
    public ProductWebSocketHandler productWebSocketHandler(final R2dbcEntityOperations template,
                                                           final Flux<Product> productGenerator,
                                                           final ObjectMapper objectMapper)
    {
        productGenerator.subscribe();
        return new ProductWebSocketHandler(template, productGenerator, objectMapper);
    }

    @Bean
    public HandlerMapping handlerMapping(final WebSocketHandler productWebSocketHandler)
    {
        Map<String, WebSocketHandler> map = Map.of("/ws-products", productWebSocketHandler);
        int order = -1; // before annotated controllers
        return new SimpleUrlHandlerMapping(map, order);
    }

    @Bean
    public Flux<Product> productGenerator(R2dbcEntityOperations r2dbcEntityOperations)
    {
        Faker faker = new Faker();
        return Flux.interval(Duration.of(15, ChronoUnit.SECONDS), Duration.of(50, ChronoUnit.MILLIS))
            .flatMap(tick ->
                Flux.range(0, 1000)
                    .flatMap(i ->
                    {
                        Product product = new Product();
                        product.setName(faker.funnyName().name());
                        product.setPrice(faker.number().randomDouble(2, 1, 10000));
                        return r2dbcEntityOperations.insert(product);
                    })).doOnNext(p -> System.out.println("creating product: " + p))
            .takeUntil(p -> p.getId() > 500000);
    }
}