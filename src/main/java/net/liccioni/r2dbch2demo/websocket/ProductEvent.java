package net.liccioni.r2dbch2demo.websocket;

import org.springframework.context.ApplicationEvent;

import net.liccioni.r2dbch2demo.model.Product;

public class ProductEvent extends ApplicationEvent
{
    private Product product;

    public ProductEvent(final Object source, Product product)
    {
        super(source);
        this.product = product;
    }

    public Product getProduct()
    {
        return product;
    }
}
