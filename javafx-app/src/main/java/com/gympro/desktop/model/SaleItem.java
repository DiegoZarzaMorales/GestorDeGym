package com.gympro.desktop.model;

public class SaleItem {
    public int id_producto;
    public String nombre;
    public int cantidad;
    public double precio_unitario;
    public double subtotal;

    public SaleItem() {}

    public SaleItem(Product p, int cantidad) {
        this.id_producto = p.id_producto;
        this.nombre = p.nombre;
        this.cantidad = cantidad;
        this.precio_unitario = p.precio;
        this.subtotal = p.precio * cantidad;
    }
}
