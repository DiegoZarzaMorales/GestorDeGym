package com.gympro.desktop;

import com.gympro.desktop.ui.AdminView;
import com.gympro.desktop.ui.AccessTerminalView;
import com.gympro.desktop.ui.PosView;
import com.gympro.desktop.data.GymStore;
import javafx.application.Application;
import javafx.geometry.Insets;
import javafx.scene.Scene;
import javafx.scene.control.Label;
import javafx.scene.control.Tab;
import javafx.scene.control.TabPane;
import javafx.scene.layout.HBox;
import javafx.scene.layout.Priority;
import javafx.scene.layout.VBox;
import javafx.stage.Stage;

import java.nio.file.Path;

public class MainApp extends Application {

    @Override
    public void start(Stage stage) {
        Path dataFile = Path.of("..", "data", "database.json").normalize();
        GymStore store = new GymStore(dataFile);
        store.load();

        VBox root = new VBox(14);
        root.setPadding(new Insets(20));

        HBox top = new HBox(12);
        top.getStyleClass().add("gp-topbar");
        VBox titles = new VBox(2);
        Label title = new Label("GymPro Desktop");
        title.getStyleClass().add("gp-title");
        Label subtitle = new Label("Admin • Terminal de Acceso • POS (todo en una app)");
        subtitle.getStyleClass().add("gp-subtitle");
        titles.getChildren().addAll(title, subtitle);
        HBox.setHgrow(titles, Priority.ALWAYS);
        top.getChildren().addAll(titles);

        TabPane tabs = new TabPane();
        tabs.setTabClosingPolicy(TabPane.TabClosingPolicy.UNAVAILABLE);

        Tab admin = new Tab("Administración", new AdminView(store));
        Tab access = new Tab("Terminal Acceso", new AccessTerminalView(store));
        Tab pos = new Tab("Terminal POS", new PosView(store));
        tabs.getTabs().addAll(admin, access, pos);

        root.getChildren().addAll(top, tabs);
        VBox.setVgrow(tabs, Priority.ALWAYS);

        Scene scene = new Scene(root, 1200, 760);
        scene.getStylesheets().add(getClass().getResource("/com/gympro/desktop/app.css").toExternalForm());

        stage.setTitle("GymPro Desktop");
        stage.setScene(scene);
        stage.show();

        stage.setOnCloseRequest(e -> store.save());
    }

    public static void main(String[] args) {
        launch(args);
    }
}
