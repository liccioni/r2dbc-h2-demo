package net.liccioni.r2dbch2demo;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/thread")
public class ThreadController
{
    @GetMapping("/name")
    public Mono<String> getThreadName() {
        System.out.println(Thread.currentThread());
        return Mono.just(Thread.currentThread().toString());
    }
}
