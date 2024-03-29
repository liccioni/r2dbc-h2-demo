package net.liccioni.r2dbch2demo.model;

import java.util.UUID;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Table
public class Product
{
    @Id
    @Getter
//    private UUID id;
    private long id;

    @NotNull
    @Size(max = 255, message = "The property 'name' must be less than or equal to 255 characters.")
    private String name;

    @NotNull
    private double price;
}