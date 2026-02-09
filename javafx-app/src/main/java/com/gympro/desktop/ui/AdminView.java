package com.gympro.desktop.ui;

import com.gympro.desktop.data.GymStore;
import com.gympro.desktop.model.Member;
import com.gympro.desktop.model.Product;
import com.gympro.desktop.model.SubscriptionType;
import javafx.collections.FXCollections;
import javafx.geometry.Insets;
import javafx.scene.control.*;
import javafx.scene.layout.*;

import java.time.LocalDate;

public class AdminView extends VBox {

    private final GymStore store;

    private final TableView<Member> membersTable = new TableView<>();
    private final TableView<Product> productsTable = new TableView<>();

    private final Label kpiMiembros = new Label("0");
    private final Label kpiActivos = new Label("0");
    private final Label kpiGanancias = new Label("$0.00");

    public AdminView(GymStore store) {
        super(14);
        this.store = store;
        setPadding(new Insets(18));

        getChildren().addAll(buildKpis(), buildMembersCard(), buildProductsCard());
        refresh();
    }

    private HBox buildKpis() {
        HBox row = new HBox(14);

        row.getChildren().addAll(
                kpiCard("Total miembros", kpiMiembros),
                kpiCard("Miembros activos", kpiActivos),
                kpiCard("Ganancias hoy", kpiGanancias)
        );
        return row;
    }

    private VBox kpiCard(String label, Label value) {
        VBox card = new VBox(8);
        card.getStyleClass().add("gp-card");
        Label h = new Label(label);
        h.getStyleClass().add("gp-muted");
        value.setStyle("-fx-font-size: 26px; -fx-font-weight: 900; -fx-text-fill: #111827;");
        card.getChildren().addAll(h, value);
        VBox.setVgrow(card, Priority.NEVER);
        HBox.setHgrow(card, Priority.ALWAYS);
        return card;
    }

    private VBox buildMembersCard() {
        VBox card = new VBox(12);
        card.getStyleClass().add("gp-card");

        HBox header = new HBox(10);
        Label h = new Label("Miembros");
        h.getStyleClass().add("gp-h2");
        Region spacer = new Region();
        HBox.setHgrow(spacer, Priority.ALWAYS);
        Button add = new Button("Agregar");
        add.getStyleClass().addAll("gp-btn-primary");
        add.setOnAction(e -> showAddMember());
        header.getChildren().addAll(h, spacer, add);

        membersTable.setColumnResizePolicy(TableView.CONSTRAINED_RESIZE_POLICY);
        TableColumn<Member, Number> cId = new TableColumn<>("ID");
        cId.setCellValueFactory(d -> new javafx.beans.property.SimpleIntegerProperty(d.getValue().id_miembro));

        TableColumn<Member, String> cNom = new TableColumn<>("Nombre");
        cNom.setCellValueFactory(d -> new javafx.beans.property.SimpleStringProperty(d.getValue().nombreCompleto()));

        TableColumn<Member, String> cTel = new TableColumn<>("Teléfono");
        cTel.setCellValueFactory(d -> new javafx.beans.property.SimpleStringProperty(d.getValue().telefono));

        TableColumn<Member, String> cAct = new TableColumn<>("Activo");
        cAct.setCellValueFactory(d -> new javafx.beans.property.SimpleStringProperty(d.getValue().activo ? "Sí" : "No"));

        TableColumn<Member, String> cSub = new TableColumn<>("Suscripción" );
        cSub.setCellValueFactory(d -> new javafx.beans.property.SimpleStringProperty(
                d.getValue().suscripcion == null ? "—" : d.getValue().suscripcion.tipo.toString()
        ));

        membersTable.getColumns().setAll(cId, cNom, cTel, cSub, cAct);

        Button setSub = new Button("Asignar suscripción");
        setSub.getStyleClass().add("gp-btn-success");
        setSub.setOnAction(e -> showSetSubscription());

        card.getChildren().addAll(header, membersTable, setSub);
        return card;
    }

    private VBox buildProductsCard() {
        VBox card = new VBox(12);
        card.getStyleClass().add("gp-card");

        HBox header = new HBox(10);
        Label h = new Label("Inventario");
        h.getStyleClass().add("gp-h2");
        Region spacer = new Region();
        HBox.setHgrow(spacer, Priority.ALWAYS);
        Button add = new Button("Agregar");
        add.getStyleClass().add("gp-btn-primary");
        add.setOnAction(e -> showAddProduct());
        header.getChildren().addAll(h, spacer, add);

        productsTable.setColumnResizePolicy(TableView.CONSTRAINED_RESIZE_POLICY);

        TableColumn<Product, Number> cId = new TableColumn<>("ID");
        cId.setCellValueFactory(d -> new javafx.beans.property.SimpleIntegerProperty(d.getValue().id_producto));

        TableColumn<Product, String> cNom = new TableColumn<>("Producto");
        cNom.setCellValueFactory(d -> new javafx.beans.property.SimpleStringProperty(d.getValue().nombre));

        TableColumn<Product, String> cCat = new TableColumn<>("Categoría");
        cCat.setCellValueFactory(d -> new javafx.beans.property.SimpleStringProperty(d.getValue().categoria));

        TableColumn<Product, String> cCod = new TableColumn<>("Código" );
        cCod.setCellValueFactory(d -> new javafx.beans.property.SimpleStringProperty(d.getValue().codigo_barras));

        TableColumn<Product, Number> cStock = new TableColumn<>("Stock");
        cStock.setCellValueFactory(d -> new javafx.beans.property.SimpleIntegerProperty(d.getValue().cantidad));

        TableColumn<Product, String> cPrecio = new TableColumn<>("Precio");
        cPrecio.setCellValueFactory(d -> new javafx.beans.property.SimpleStringProperty(String.format("$%.2f", d.getValue().precio)));

        productsTable.getColumns().setAll(cId, cNom, cCat, cCod, cStock, cPrecio);

        card.getChildren().addAll(header, productsTable);
        return card;
    }

    private void showAddMember() {
        Dialog<Void> dialog = new Dialog<>();
        dialog.setTitle("Agregar miembro");
        dialog.getDialogPane().getButtonTypes().addAll(ButtonType.CANCEL, ButtonType.OK);

        TextField nombre = new TextField();
        TextField apellido = new TextField();
        TextField telefono = new TextField();
        TextField email = new TextField();

        GridPane grid = new GridPane();
        grid.setHgap(12);
        grid.setVgap(12);
        grid.setPadding(new Insets(16));
        grid.addRow(0, new Label("Nombre"), nombre);
        grid.addRow(1, new Label("Apellido"), apellido);
        grid.addRow(2, new Label("Teléfono"), telefono);
        grid.addRow(3, new Label("Email"), email);

        dialog.getDialogPane().setContent(grid);

        dialog.setResultConverter(bt -> {
            if (bt == ButtonType.OK) {
                store.addMember(nombre.getText(), apellido.getText(), telefono.getText(), email.getText());
                refresh();
            }
            return null;
        });
        dialog.showAndWait();
    }

    private void showSetSubscription() {
        Member sel = membersTable.getSelectionModel().getSelectedItem();
        if (sel == null) {
            alert("Selecciona un miembro.");
            return;
        }

        Dialog<Void> dialog = new Dialog<>();
        dialog.setTitle("Asignar suscripción");
        dialog.getDialogPane().getButtonTypes().addAll(ButtonType.CANCEL, ButtonType.OK);

        ComboBox<SubscriptionType> tipo = new ComboBox<>(FXCollections.observableArrayList(SubscriptionType.values()));
        tipo.getSelectionModel().select(SubscriptionType.MENSUAL);

        DatePicker inicio = new DatePicker(LocalDate.now());
        DatePicker fin = new DatePicker(LocalDate.now().plusMonths(1));

        tipo.setOnAction(e -> {
            SubscriptionType t = tipo.getValue();
            if (t == null) return;
            inicio.setValue(LocalDate.now());
            switch (t) {
                case MENSUAL -> fin.setValue(LocalDate.now().plusMonths(1));
                case TRIMESTRAL -> fin.setValue(LocalDate.now().plusMonths(3));
                case SEMESTRAL -> fin.setValue(LocalDate.now().plusMonths(6));
                case ANUAL -> fin.setValue(LocalDate.now().plusYears(1));
            }
        });

        GridPane grid = new GridPane();
        grid.setHgap(12);
        grid.setVgap(12);
        grid.setPadding(new Insets(16));
        grid.addRow(0, new Label("Tipo"), tipo);
        grid.addRow(1, new Label("Inicio"), inicio);
        grid.addRow(2, new Label("Fin"), fin);
        dialog.getDialogPane().setContent(grid);

        dialog.setResultConverter(bt -> {
            if (bt == ButtonType.OK) {
                store.setSubscription(sel, tipo.getValue(), inicio.getValue(), fin.getValue());
                refresh();
            }
            return null;
        });
        dialog.showAndWait();
    }

    private void showAddProduct() {
        Dialog<Void> dialog = new Dialog<>();
        dialog.setTitle("Agregar producto");
        dialog.getDialogPane().getButtonTypes().addAll(ButtonType.CANCEL, ButtonType.OK);

        TextField nombre = new TextField();
        TextField categoria = new TextField();
        TextField codigo = new TextField();
        Spinner<Integer> stock = new Spinner<>(0, 99999, 1);
        TextField precio = new TextField();

        GridPane grid = new GridPane();
        grid.setHgap(12);
        grid.setVgap(12);
        grid.setPadding(new Insets(16));
        grid.addRow(0, new Label("Nombre"), nombre);
        grid.addRow(1, new Label("Categoría"), categoria);
        grid.addRow(2, new Label("Código (opcional)"), codigo);
        grid.addRow(3, new Label("Stock"), stock);
        grid.addRow(4, new Label("Precio"), precio);
        dialog.getDialogPane().setContent(grid);

        dialog.setResultConverter(bt -> {
            if (bt == ButtonType.OK) {
                double p;
                try {
                    p = Double.parseDouble(precio.getText());
                } catch (Exception ex) {
                    alert("Precio inválido");
                    return null;
                }
                store.addProduct(nombre.getText(), categoria.getText(), stock.getValue(), p, codigo.getText());
                refresh();
            }
            return null;
        });
        dialog.showAndWait();
    }

    private void refresh() {
        membersTable.setItems(FXCollections.observableArrayList(store.db().miembros));
        productsTable.setItems(FXCollections.observableArrayList(store.db().inventario));

        kpiMiembros.setText(String.valueOf(store.db().miembros.size()));
        long activos = store.db().miembros.stream().filter(m -> m.suscripcion != null && m.suscripcion.estaActiva(LocalDate.now())).count();
        kpiActivos.setText(String.valueOf(activos));
        kpiGanancias.setText(String.format("$%.2f", store.gananciasHoy()));
    }

    private void alert(String msg) {
        Alert a = new Alert(Alert.AlertType.INFORMATION, msg, ButtonType.OK);
        a.setHeaderText(null);
        a.showAndWait();
    }
}
