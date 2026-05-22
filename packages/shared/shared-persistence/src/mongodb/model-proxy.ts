import { Connection, Model, Schema } from 'mongoose';

export class ConnectionRegistry {
  private static connections = new Map<string, Connection>();
  private static fallbackMongoose: any = null;

  static registerConnection(name: string, connection: Connection) {
    this.connections.set(name, connection);
  }

  static getActiveConnection(name: string = 'default'): Connection {
    const conn = this.connections.get(name);
    if (conn) {
      return conn;
    }
    
    // Fallback: If NestJS has not initialized yet (e.g. during CLI commands, migration or startup scripts)
    // resolve using global mongoose instance.
    if (!this.fallbackMongoose) {
      try {
        this.fallbackMongoose = require('mongoose');
      } catch (err) {
        // Mongoose not available, ignore
      }
    }
    if (this.fallbackMongoose && this.fallbackMongoose.connection) {
      return this.fallbackMongoose.connection;
    }
    
    throw new Error(`Mongoose connection '${name}' is not registered and no fallback connection is available.`);
  }
}

export function createModelProxy<T>(modelName: string, schema: Schema, connectionName: string = 'default'): Model<T> {
  // Empty constructor function to serve as the Proxy target.
  // This allows the proxy to be constructed with 'new'.
  const target = function (doc?: any) {
    const conn = ConnectionRegistry.getActiveConnection(connectionName);
    const RealModel = conn.models[modelName] || conn.model(modelName, schema);
    return new RealModel(doc);
  };

  return new Proxy(target, {
    construct(target, argArray, newTarget) {
      const conn = ConnectionRegistry.getActiveConnection(connectionName);
      const RealModel = conn.models[modelName] || conn.model(modelName, schema);
      return Reflect.construct(RealModel, argArray, newTarget);
    },
    get(target, prop, receiver) {
      const conn = ConnectionRegistry.getActiveConnection(connectionName);
      const RealModel = conn.models[modelName] || conn.model(modelName, schema);
      
      const value = Reflect.get(RealModel, prop);
      if (typeof value === 'function') {
        return value.bind(RealModel);
      }
      return value;
    },
    set(target, prop, value, receiver) {
      const conn = ConnectionRegistry.getActiveConnection(connectionName);
      const RealModel = conn.models[modelName] || conn.model(modelName, schema);
      return Reflect.set(RealModel, prop, value);
    },
    has(target, prop) {
      const conn = ConnectionRegistry.getActiveConnection(connectionName);
      const RealModel = conn.models[modelName] || conn.model(modelName, schema);
      return Reflect.has(RealModel, prop);
    }
  }) as unknown as Model<T>;
}
