package com.gympro.desktop.model;

import java.time.LocalDate;

public class Subscription {
    public SubscriptionType tipo;
    public LocalDate fechaInicio;
    public LocalDate fechaFin;

    public Subscription() {}

    public Subscription(SubscriptionType tipo, LocalDate fechaInicio, LocalDate fechaFin) {
        this.tipo = tipo;
        this.fechaInicio = fechaInicio;
        this.fechaFin = fechaFin;
    }

    public boolean estaActiva(LocalDate hoy) {
        if (fechaInicio == null || fechaFin == null) return false;
        return (hoy.isEqual(fechaInicio) || hoy.isAfter(fechaInicio)) && (hoy.isEqual(fechaFin) || hoy.isBefore(fechaFin));
    }
}
