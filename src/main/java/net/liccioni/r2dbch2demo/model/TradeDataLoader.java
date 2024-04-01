package net.liccioni.r2dbch2demo.model;


import static java.lang.Math.floor;
import static java.lang.Math.random;
import static java.lang.String.format;
import static java.util.Arrays.asList;

import java.time.Duration;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

import org.springframework.data.r2dbc.core.R2dbcEntityOperations;

import reactor.core.publisher.Flux;


public class TradeDataLoader
{

    private final R2dbcEntityOperations r2dbcEntityOperations;
    // add / remove products to change the data set
    private List<String> PRODUCTS = asList("Palm Oil", "Rubber", "Wool", "Amber", "Copper", "Lead", "Zinc", "Tin", "Aluminium",
        "Aluminium Alloy", "Nickel", "Cobalt", "Molybdenum", "Recycled Steel", "Corn", "Oats", "Rough Rice",
        "Soybeans", "Rapeseed", "Soybean Meal", "Soybean Oil", "Wheat", "Milk", "Coca", "Coffee C",
        "Cotton No.2", "Sugar No.11", "Sugar No.14");

    // add / remove portfolios to change the data set
    private List<String> PORTFOLIOS = asList("Aggressive", "Defensive", "Income", "Speculative", "Hybrid");

    // start the book id's and trade id's at some future random number, looks more realistic than starting them at 0
    private long nextBookId = 62472;
    private long nextTradeId = 24287;
    private long nextBatchId = 101;

    public TradeDataLoader(final R2dbcEntityOperations r2dbcEntityOperations)
    {

        this.r2dbcEntityOperations = r2dbcEntityOperations;
    }

    public void loadTradeData()
    {
//        insertBatch(createTradeData());
        Flux.fromIterable(createTradeData())
//            .take(100000)
            .delaySubscription(Duration.of(15, ChronoUnit.SECONDS))
            .flatMap(r2dbcEntityOperations::insert)
            .log()
            .subscribe();
    }

    private List<Trade> createTradeData()
    {
        List<Trade> trades = new ArrayList<>();
        long thisBatch = nextBatchId++;
        for (String product : PRODUCTS)
        {
            for (String portfolio : PORTFOLIOS)
            {
                for (int k = 0; k < numberBetween(1000, 2000); k++)
                {
                    String book = createBookName();
                    trades.add(createTradeRecord(product, portfolio, book, thisBatch));
                }
            }
        }
        return trades;
    }

    private Trade createTradeRecord(String product, String portfolio, String book, Long batch)
    {

        double current = (floor(random() * 100000) + 1000);
        double previous = current + (floor(random() * 10000) - 20000);
        final var trade = new Trade();
        trade.setProduct(product);
        trade.setPortfolio(portfolio);
        trade.setBook(book);
        trade.setBatch(batch);
        trade.setTradeId(createTradeId());
        trade.setBidType(numberBetween(1, 10) > 5 ? "Buy" : "Sell");
        trade.setDealType(numberBetween(1, 10) > 2 ? "Physical" : "Financial");
        trade.setCurrentValue(current);
        trade.setPreviousValue(previous);
        trade.setSubmitterId(randomNegation(numberBetween(10, 10000)));
        trade.setSubmitterDealId(randomNegation(numberBetween(10, 10000)));
        trade.setPl1(randomNegation(numberBetween(100, 100000)));
        trade.setPl2(randomNegation(numberBetween(100, 100000)));
        trade.setGainDx(randomNegation(numberBetween(100, 100000)));
        trade.setSxPx(randomNegation(numberBetween(100, 100000)));
        trade.setX99Out(randomNegation(numberBetween(100, 100000)));
        return trade;
    }

    private String createBookName()
    {
        return format("GL-%d", ++nextBookId);
    }

    private Long createTradeId()
    {
        return ++nextTradeId;
    }

    private Long numberBetween(long from, long to)
    {
        return ThreadLocalRandom.current().nextLong(from, to);
    }

    private long randomNegation(long number)
    {
        return (numberBetween(0, 2) == 0 ? -1 : 1) * number;
    }

    private double randomNegation(double number)
    {
        return (numberBetween(0, 2) == 0 ? -1 : 1) * number;
    }
}