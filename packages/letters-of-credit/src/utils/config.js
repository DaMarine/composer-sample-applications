import React, { Component } from 'react';

class Config {
    constructor() {
        this.webSocketURL = "ws://localhost:3000";
        this.httpURL = "http://localhost:3000/api";

        if (process.env.REACT_APP_REST_SERVER_CONFIG) {
            try {
                let rest_server_config = JSON.parse(process.env.REACT_APP_REST_SERVER_CONFIG);
                if (rest_server_config.webSocketURL) {
                    this.webSocketURL = rest_server_config.webSocketURL;
                } 
                if (rest_server_config.httpURL) {
                    this.httpURL = rest_server_config.httpURL;
                }
            } catch (err) {
                console.error('CONFIG ERROR', err);
            }
        }
    }
}

export default Config;