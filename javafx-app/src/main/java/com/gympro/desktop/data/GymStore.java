package com.gympro.desktop.data;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.gympro.desktop.model.*;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

public class GymStore {
    private final Path file;
    private final ObjectMapper mapper;
    private GymDatabase db = new GymDatabase();

    public GymStore(Path file) {
        this.file = file;
        this.mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        mapper.configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);
        mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
    }

    public GymDatabase db() {
        return db;
    }

    public void load() {
        try {
            if (!Files.exists(file)) {
                return;
            }
            byte[] bytes = Files.readAllBytes(file);
            if (bytes.length == 0) return;
            db = mapper.readValue(bytes, GymDatabase.class);
            // asegurar códigos de barras
            for (Product p : db.inventario) {
                if (p.codigo_barras == null || p.codigo_barras.isBlank()) {
                    p.codigo_barras = p.codigoBarrasAuto();
                }
            }
        } catch (Exception ignored) {
            // si el JSON viejo tiene formatos diferentes, no rompemos la app; solo arrancamos vacío
            db = new GymDatabase();
        }
    }

    public void save() {
        try {
            Files.createDirectories(file.getParent());
            mapper.writerWithDefaultPrettyPrinter().writeValue(file.toFile(), db);
        } catch (IOException ignored) {
        }
    }

    // ===== Miembros =====

    public Member addMember(String nombre, String apellido, String telefono, String email) {
        int nextId = db.miembros.stream().map(m -> m.id_miembro).max(Comparator.naturalOrder()).orElse(0) + 1;
        Member m = new Member();
        m.id_miembro = nextId;
        m.nombre = nombre;
        m.apellido = apellido;
        m.telefono = telefono;
        m.email = email;
        m.activo = true;
        db.miembros.add(m);
        save();
        return m;
    }

    public Optional<Member> findMemberByPhone(String telefono) {
        if (telefono == null) return Optional.empty();
        String t = telefono.trim();
        return db.miembros.stream().filter(m -> m.telefono != null && m.telefono.trim().equals(t)).findFirst();
    }

    public void setSubscription(Member m, SubscriptionType tipo, LocalDate inicio, LocalDate fin) {
        m.suscripcion = new Subscription(tipo, inicio, fin);
        save();
    }

    // ===== Inventario =====

    public Product addProduct(String nombre, String categoria, int cantidad, double precio, String codigoBarras) {
        int nextId = db.inventario.stream().map(p -> p.id_producto).max(Comparator.naturalOrder()).orElse(0) + 1;
        Product p = new Product();
        p.id_producto = nextId;
        p.nombre = nombre;
        p.categoria = categoria;
        p.cantidad = cantidad;
        p.precio = precio;
        p.codigo_barras = (codigoBarras == null || codigoBarras.isBlank()) ? String.format("BAR%06d", nextId) : codigoBarras.trim();
        db.inventario.add(p);
        save();
        return p;
    }

    public Optional<Product> findProductByBarcode(String codigo) {
        if (codigo == null) return Optional.empty();
        String c = codigo.trim();
        return db.inventario.stream().filter(p -> p.codigo_barras != null && p.codigo_barras.trim().equalsIgnoreCase(c)).findFirst();
    }

    // ===== Acceso =====

    public AccessRecord registerAccess(Member m, String tipo) {
        int nextId = db.registros_acceso.stream().map(r -> r.id_registro).max(Comparator.naturalOrder()).orElse(0) + 1;
        AccessRecord r = new AccessRecord();
        r.id_registro = nextId;
        r.id_miembro = m.id_miembro;
        r.tipo = tipo;
        r.fecha_hora = LocalDateTime.now();
        db.registros_acceso.add(r);
        save();
        return r;
    }

    // ===== Ventas =====

    public Sale processSale(List<SaleItem> items) {
        if (items == null || items.isEmpty()) throw new IllegalArgumentException("Carrito vacío");

        // validar stock
        for (SaleItem it : items) {
            Product p = db.inventario.stream().filter(x -> x.id_producto == it.id_producto).findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado: " + it.id_producto));
            if (it.cantidad > p.cantidad) {
                throw new IllegalArgumentException("Stock insuficiente de " + p.nombre + ". Disponible: " + p.cantidad);
            }
        }

        // descontar stock + construir venta
        int nextId = db.ventas.stream().map(v -> v.id_venta).max(Comparator.naturalOrder()).orElse(0) + 1;
        Sale v = new Sale();
        v.id_venta = nextId;
        v.fecha_hora = LocalDateTime.now();

        double total = 0;
        for (SaleItem it : items) {
            Product p = db.inventario.stream().filter(x -> x.id_producto == it.id_producto).findFirst().orElseThrow();
            p.cantidad -= it.cantidad;
            SaleItem out = new SaleItem();
            out.id_producto = p.id_producto;
            out.nombre = p.nombre;
            out.cantidad = it.cantidad;
            out.precio_unitario = p.precio;
            out.subtotal = p.precio * it.cantidad;
            v.productos.add(out);
            total += out.subtotal;
        }
        v.total = total;
        db.ventas.add(v);
        save();
        return v;
    }

    public double gananciasHoy() {
        LocalDate hoy = LocalDate.now();
        return db.ventas.stream()
                .filter(v -> v.fecha_hora != null && v.fecha_hora.toLocalDate().isEqual(hoy))
                .mapToDouble(v -> v.total)
                .sum();
    }
}
