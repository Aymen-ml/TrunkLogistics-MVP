import { getHealthStatus, query } from '../config/database.js';
import logger from '../utils/logger.js';

class DatabaseMonitor {
  constructor() {
    this.isMonitoring = false;
    this.monitoringInterval = null;
    this.healthCheckInterval = 30000; // 30 seconds
    this.slowQueryThreshold = 5000; // 5 seconds
    this.connectionWarningThreshold = 15; // Warn if more than 15 active connections
  }

  // Start monitoring database health
  startMonitoring() {
    if (this.isMonitoring) {
      logger.warn('Database monitoring is already running');
      return;
    }

    this.isMonitoring = true;
    logger.info('Starting database health monitoring', {
      interval: this.healthCheckInterval,
      slowQueryThreshold: this.slowQueryThreshold
    });

    this.monitoringInterval = setInterval(async () => {
      await this.performHealthCheck();
    }, this.healthCheckInterval);
  }

  // Stop monitoring
  stopMonitoring() {
    if (!this.isMonitoring) {
      return;
    }

    this.isMonitoring = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    logger.info('Database monitoring stopped');
  }

  // Perform comprehensive health check
  async performHealthCheck() {
    try {
      const healthStatus = await getHealthStatus();
      
      if (healthStatus.status === 'healthy') {
        // Check for potential issues
        await this.checkConnectionCount(healthStatus.activeConnections);
        await this.checkDatabaseSize();
        await this.checkSlowQueries();
      } else {
        logger.error('Database health check failed', healthStatus);
      }

    } catch (error) {
      logger.error('Health check monitoring error', { error: error.message });
    }
  }

  // Monitor connection count
  async checkConnectionCount(activeConnections) {
    if (activeConnections > this.connectionWarningThreshold) {
      logger.warn('High number of active database connections', {
        activeConnections,
        threshold: this.connectionWarningThreshold
      });
    }
  }

  // Monitor database size growth
  async checkDatabaseSize() {
    try {
      const result = await query(`
        SELECT 
          pg_size_pretty(pg_database_size(current_database())) as size,
          pg_database_size(current_database()) as size_bytes
      `);

      const sizeBytes = parseInt(result.rows[0].size_bytes);
      const sizeMB = Math.round(sizeBytes / 1024 / 1024);

      // Log size if it's growing significantly (over 500MB)
      if (sizeMB > 500) {
        logger.warn('Database size is growing large', {
          size: result.rows[0].size,
          sizeMB
        });
      }

    } catch (error) {
      logger.error('Error checking database size', { error: error.message });
    }
  }

  // Check for slow queries
  async checkSlowQueries() {
    try {
      const result = await query(`
        SELECT 
          query,
          calls,
          total_time,
          mean_time,
          max_time
        FROM pg_stat_statements 
        WHERE mean_time > $1
        ORDER BY mean_time DESC 
        LIMIT 5
      `, [this.slowQueryThreshold]);

      if (result.rows.length > 0) {
        logger.warn('Slow queries detected', {
          count: result.rows.length,
          queries: result.rows.map(row => ({
            query: row.query.substring(0, 100) + '...',
            meanTime: Math.round(row.mean_time),
            maxTime: Math.round(row.max_time),
            calls: row.calls
          }))
        });
      }

    } catch (error) {
      // pg_stat_statements might not be enabled, which is fine
      if (!error.message.includes('pg_stat_statements')) {
        logger.debug('Could not check slow queries (pg_stat_statements not available)');
      }
    }
  }

  // Get current monitoring status
  getStatus() {
    return {
      isMonitoring: this.isMonitoring,
      healthCheckInterval: this.healthCheckInterval,
      slowQueryThreshold: this.slowQueryThreshold,
      connectionWarningThreshold: this.connectionWarningThreshold
    };
  }

  // Update monitoring configuration
  updateConfig(config) {
    if (config.healthCheckInterval) {
      this.healthCheckInterval = config.healthCheckInterval;
    }
    if (config.slowQueryThreshold) {
      this.slowQueryThreshold = config.slowQueryThreshold;
    }
    if (config.connectionWarningThreshold) {
      this.connectionWarningThreshold = config.connectionWarningThreshold;
    }

    logger.info('Database monitoring configuration updated', this.getStatus());

    // Restart monitoring with new config
    if (this.isMonitoring) {
      this.stopMonitoring();
      this.startMonitoring();
    }
  }
}

// Create singleton instance
const databaseMonitor = new DatabaseMonitor();

// Start monitoring in production
if (process.env.NODE_ENV === 'production') {
  databaseMonitor.startMonitoring();
}

// Graceful shutdown
process.on('SIGINT', () => {
  databaseMonitor.stopMonitoring();
});

process.on('SIGTERM', () => {
  databaseMonitor.stopMonitoring();
});

export default databaseMonitor;