package com.example.enigma.Utils;
import com.mongodb.*;
import com.mongodb.client.*;
import com.mongodb.client.MongoClients;
import org.bson.Document;

public class MongoConnection {

    private MongoClient client;

    public MongoConnection() {
        String connectionString = "mongodb+srv://gabinv2016_db_user:G72321408g@aventurasubmarina.ffb14rg.mongodb.net/aventuraSubmarinaDB?retryWrites=true&w=majority&appName=enigma";
        ServerApi serverApi = ServerApi.builder()
                .version(ServerApiVersion.V1)
                .build();
        MongoClientSettings settings = MongoClientSettings.builder()
                .applyConnectionString(new ConnectionString(connectionString))
                .serverApi(serverApi)
                .build();
        // Create a new client and connect to the server
        try (MongoClient mongoClient = MongoClients.create(settings)) {
            try {
                // Send a ping to confirm a successful connection
                client = mongoClient;
                MongoDatabase database = mongoClient.getDatabase("root");
                database.runCommand(new Document("ping", 1));
                System.out.println("Pinged your deployment. You successfully connected to MongoDB!");
            } catch (MongoException e) {
                e.printStackTrace();
            }
        }
    }
    public void closeConnection() {
        if (client != null) {
            client.close();
        }
    }
}