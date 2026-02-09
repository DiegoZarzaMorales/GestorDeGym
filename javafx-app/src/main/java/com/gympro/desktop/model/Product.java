package com.gympro.desktop.model;

public class Product {
    public int id_producto;
    public String nombre;
    public String categoria;
    public int cantidad;
    public double precio;
    public String codigo_barras;

    public Product() {}

    public String codigoBarrasAuto() {
        if (codigo_barras != null && !codigo_barras.isBlank()) return codigo_barras;
        return String.format("BAR%06d", id_producto);
    }
}
