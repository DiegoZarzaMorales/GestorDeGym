package com.gympro.desktop.ui;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import com.gympro.desktop.data.GymStore;
import com.gympro.desktop.model.Product;
import com.gympro.desktop.model.Sale;
import com.gympro.desktop.model.SaleItem;

import javafx.collections.FXCollections;
import javafx.geometry.Insets;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.TableColumn;
import javafx.scene.control.TableView;
import javafx.scene.control.TextField;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.HBox;
import javafx.scene.layout.Pane;
import javafx.scene.layout.Priority;
import javafx.scene.layout.Region;
import javafx.scene.layout.VBox;

public class PosView extends BorderPane {

    private final GymStore store;

    private final TextField barcodeField = new TextField();
    private final Label totalLabel = new Label("$0.00");
    private final Label statusLabel = new Label("Listo");

    private final TableView<CartRow> cartTable = new TableView<>();

    private final List<CartRow> cart = new ArrayList<>();

    public PosView(GymStore store) {
        this.store = store;
        setPadding(new Insets(18));

        setTop(buildHeader());
        setCenter(buildCart());
        setBottom(buildFooter());

        refreshCart();
    }

    private Pane buildHeader() {
        VBox card = new VBox(10);
        card.getStyleClass().add("gp-card");

        Label title = new Label("Terminal de Ventas (POS)");
        title.getStyleClass().add("gp-h2");

        barcodeField.setPromptText("Escanea / escribe código de barras y Enter");
        barcodeField.getStyleClass().add("gp-input");
        barcodeField.setOnAction(e -> scanAdd());

        Button add = new Button("Agregar");
        add.getStyleClass().add("gp-btn-primary");
        add.setOnAction(e -> scanAdd());

        Button clear = new Button("Vaciar");
        clear.getStyleClass().add("gp-btn");
        clear.setOnAction(e -> {
            cart.clear();
            setStatus("Carrito vacío", false);
            refreshCart();
        });

        HBox row = new HBox(10, barcodeField, add, clear);
        HBox.setHgrow(barcodeField, Priority.ALWAYS);

        statusLabel.getStyleClass().add("gp-muted");

        card.getChildren().addAll(title, row, statusLabel);
        return card;
    }

    private Pane buildCart() {
        VBox card = new VBox(10);
        card.getStyleClass().add("gp-card");

        Label h = new Label("Carrito");
        h.getStyleClass().add("gp-h2");

        cartTable.setColumnResizePolicy(TableView.CONSTRAINED_RESIZE_POLICY);

        TableColumn<CartRow, String> cProd = new TableColumn<>("Producto");
        cProd.setCellValueFactory(d -> d.getValue().productNameProperty());

        TableColumn<CartRow, String> cCod = new TableColumn<>("Código");
        cCod.setCellValueFactory(d -> d.getValue().barcodeProperty());

        TableColumn<CartRow, Number> cQty = new TableColumn<>("Cantidad");
        cQty.setCellValueFactory(d -> d.getValue().qtyProperty());

        TableColumn<CartRow, String> cPrice = new TableColumn<>("Precio");
        cPrice.setCellValueFactory(d -> d.getValue().unitPriceProperty());

        TableColumn<CartRow, String> cSub = new TableColumn<>("Subtotal");
        cSub.setCellValueFactory(d -> d.getValue().subtotalProperty());

        cartTable.getColumns().setAll(cProd, cCod, cQty, cPrice, cSub);

        HBox totals = new HBox(10);
        Region spacer = new Region();
        HBox.setHgrow(spacer, Priority.ALWAYS);
        Label t = new Label("Total");
        t.getStyleClass().add("gp-muted");
        totalLabel.setStyle("-fx-font-size: 22px; -fx-font-weight: 900; -fx-text-fill: #111827;");
        totals.getChildren().addAll(spacer, t, totalLabel);

        card.getChildren().addAll(h, cartTable, totals);
        VBox.setVgrow(cartTable, Priority.ALWAYS);
        return card;
    }

    private Pane buildFooter() {
        HBox row = new HBox(10);
        row.setPadding(new Insets(12, 0, 0, 0));

        Button checkout = new Button("Cobrar");
        checkout.getStyleClass().add("gp-btn-success");
        checkout.setOnAction(e -> checkout());

        row.getChildren().add(checkout);
        return row;
    }

    private void scanAdd() {
        String barcode = barcodeField.getText() == null ? "" : barcodeField.getText().trim();
        if (barcode.isBlank()) {
            setStatus("Código vacío", true);
            return;
        }

        Optional<Product> optProduct = store.findProductByBarcode(barcode);
        if (optProduct.isEmpty()) {
            setStatus("No existe ese código", true);
            return;
        }
        
        Product p = optProduct.get();

        if (p.cantidad <= 0) {
            setStatus("Sin stock: " + p.nombre, true);
            return;
        }

        CartRow existing = cart.stream().filter(r -> r.product.id_producto == p.id_producto).findFirst().orElse(null);
        if (existing == null) {
            cart.add(new CartRow(p, 1));
        } else {
            existing.qty.set(existing.qty.get() + 1);
        }

        setStatus("Agregado: " + p.nombre, false);
        refreshCart();
        barcodeField.clear();
        barcodeField.requestFocus();
    }

    private void checkout() {
        if (cart.isEmpty()) {
            setStatus("Carrito vacío", true);
            return;
        }

        List<SaleItem> items = new ArrayList<>();
        for (CartRow row : cart) {
            items.add(new SaleItem(row.product, row.qty.get()));
        }

        try {
            Sale sale = store.processSale(items);
            cart.clear();
            setStatus("Venta OK · Total $" + String.format("%.2f", sale.total), false);
            refreshCart();
        } catch (Exception ex) {
            setStatus("Error: " + ex.getMessage(), true);
        }
    }

    private void refreshCart() {
        cartTable.setItems(FXCollections.observableArrayList(cart));
        totalLabel.setText(String.format("$%.2f", cart.stream().mapToDouble(CartRow::subtotal).sum()));
    }

    private void setStatus(String msg, boolean error) {
        statusLabel.setText(msg);
        statusLabel.setStyle(error
                ? "-fx-text-fill: #991B1B; -fx-font-weight: 700;"
                : "-fx-text-fill: #065F46; -fx-font-weight: 700;"
        );
    }

    public static class CartRow {
        final Product product;
        final javafx.beans.property.SimpleStringProperty productName;
        final javafx.beans.property.SimpleStringProperty barcode;
        final javafx.beans.property.SimpleIntegerProperty qty;
        final javafx.beans.property.SimpleStringProperty unitPrice;
        final javafx.beans.property.SimpleStringProperty subtotal;

        CartRow(Product product, int qty) {
            this.product = product;
            this.productName = new javafx.beans.property.SimpleStringProperty(product.nombre);
            this.barcode = new javafx.beans.property.SimpleStringProperty(product.codigo_barras);
            this.qty = new javafx.beans.property.SimpleIntegerProperty(qty);
            this.unitPrice = new javafx.beans.property.SimpleStringProperty(String.format("$%.2f", product.precio));
            this.subtotal = new javafx.beans.property.SimpleStringProperty(String.format("$%.2f", subtotal()));

            this.qty.addListener((obs, o, n) -> this.subtotal.set(String.format("$%.2f", subtotal())));
        }

        double subtotal() {
            return qty.get() * product.precio;
        }

        javafx.beans.property.SimpleStringProperty productNameProperty() { return productName; }
        javafx.beans.property.SimpleStringProperty barcodeProperty() { return barcode; }
        javafx.beans.property.SimpleIntegerProperty qtyProperty() { return qty; }
        javafx.beans.property.SimpleStringProperty unitPriceProperty() { return unitPrice; }
        javafx.beans.property.SimpleStringProperty subtotalProperty() { return subtotal; }
    }
}
