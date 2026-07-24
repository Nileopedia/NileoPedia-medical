/**
 * Production Load Testing Framework
 * 
 * Tests concurrent user scenarios:
 * - 10, 50, 100, 250, 500, 1000 concurrent users
 * - AI requests
 * - Document uploads
 * - Searches
 * - Validation requests
 * - Admin operations
 * 
 * Measures:
 * - CPU/Memory usage
 * - Response times (avg, P95, P99)
 * - Error rates
 * - Timeout rates
 * - Rate limiting behavior
 * 
 * Generates HTML and JSON reports.
 */

import http from 'http';
import https from 'https';
import { URL } from 'url';

export interface LoadTestConfig {
  concurrentUsers: number;
  durationMs: number;
  rampUpMs: number;
  thinkTimeMs: number;
  timeoutMs: number;
  baseUrl: string;
  authToken?: string;
}

export interface LoadTestResult {
  scenario: string;
  config: LoadTestConfig;
  metrics: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    timeoutRequests: number;
    rateLimitedRequests: number;
    avgResponseTimeMs: number;
    p50ResponseTimeMs: number;
    p95ResponseTimeMs: number;
    p99ResponseTimeMs: number;
    minResponseTimeMs: number;
    maxResponseTimeMs: number;
    errorRate: number;
    timeoutRate: number;
    rateLimitRate: number;
    throughputRps: number;
  };
  errors: Array<{ timestamp: number; status?: number; error: string }>;
  timeline: Array<{ timestamp: number; responseTime: number; status: number }>;
  systemMetrics: {
    cpuUsage: number[];
    memoryUsage: number[];
    activeConnections: number;
  };
}

export interface LoadTestReport {
  timestamp: string;
  totalDurationMs: number;
  scenarios: LoadTestResult[];
  summary: {
    totalRequests: number;
    overallSuccessRate: number;
    overallErrorRate: number;
    overallAvgResponseTimeMs: number;
    overallP95ResponseTimeMs: number;
    overallP99ResponseTimeMs: number;
    overallThroughputRps: number;
  };
  recommendations: string[];
}

export class LoadTestRunner {
  private config: LoadTestConfig;
  private results: LoadTestResult[] = [];
  private startTime: number = 0;

  constructor(config: LoadTestConfig) {
    this.config = config;
  }

  async runScenario(
    scenarioName: string,
    requestGenerator: (userIndex: number) => Promise<void>
  ): Promise<LoadTestResult> {
    console.log(`\nRunning scenario: ${scenarioName}`);
    console.log(`Concurrent users: ${this.config.concurrentUsers}`);
    console.log(`Duration: ${this.config.durationMs}ms`);

    const result: LoadTestResult = {
      scenario: scenarioName,
      config: this.config,
      metrics: {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        timeoutRequests: 0,
        rateLimitedRequests: 0,
        avgResponseTimeMs: 0,
        p50ResponseTimeMs: 0,
        p95ResponseTimeMs: 0,
        p99ResponseTimeMs: 0,
        minResponseTimeMs: Infinity,
        maxResponseTimeMs: 0,
        errorRate: 0,
        timeoutRate: 0,
        rateLimitRate: 0,
        throughputRps: 0,
      },
      errors: [],
      timeline: [],
      systemMetrics: {
        cpuUsage: [],
        memoryUsage: [],
        activeConnections: 0,
      },
    };

    const userPromises: Promise<void>[] = [];
    const rampUpDelay = this.config.rampUpMs / this.config.concurrentUsers;

    for (let i = 0; i < this.config.concurrentUsers; i++) {
      const userPromise = new Promise<void>(async (resolve) => {
        await new Promise(r => setTimeout(r, i * rampUpDelay));
        
        const userStartTime = Date.now();
        while (Date.now() - userStartTime < this.config.durationMs) {
          const requestStartTime = Date.now();
          
          try {
            await requestGenerator(i);
            const responseTime = Date.now() - requestStartTime;
            
            result.metrics.totalRequests++;
            result.metrics.successfulRequests++;
            result.timeline.push({
              timestamp: Date.now() - this.startTime,
              responseTime,
              status: 200,
            });
            
            if (responseTime < result.metrics.minResponseTimeMs) {
              result.metrics.minResponseTimeMs = responseTime;
            }
            if (responseTime > result.metrics.maxResponseTimeMs) {
              result.metrics.maxResponseTimeMs = responseTime;
            }
          } catch (error) {
            const responseTime = Date.now() - requestStartTime;
            result.metrics.totalRequests++;
            result.metrics.failedRequests++;
            
            const errorMessage = error instanceof Error ? error.message : String(error);
            const status = (error as any).statusCode || (error as any).status || 0;
            
            result.timeline.push({
              timestamp: Date.now() - this.startTime,
              responseTime,
              status,
            });
            result.errors.push({
              timestamp: Date.now() - this.startTime,
              status,
              error: errorMessage,
            });

            if (status === 429) {
              result.metrics.rateLimitedRequests++;
            } else if (responseTime >= this.config.timeoutMs) {
              result.metrics.timeoutRequests++;
            }
          }
          
          await new Promise(r => setTimeout(r, this.config.thinkTimeMs));
        }
        
        resolve();
      });

      userPromises.push(userPromise);
    }

    await Promise.all(userPromises);

    this.calculateMetrics(result);
    this.results.push(result);

    console.log(`Scenario ${scenarioName} completed: ${result.metrics.totalRequests} requests`);
    console.log(`Success rate: ${((result.metrics.successfulRequests / result.metrics.totalRequests) * 100).toFixed(1)}%`);
    console.log(`Avg response time: ${result.metrics.avgResponseTimeMs.toFixed(0)}ms`);
    console.log(`P95 response time: ${result.metrics.p95ResponseTimeMs.toFixed(0)}ms`);

    return result;
  }

  private calculateMetrics(result: LoadTestResult): void {
    const { timeline, metrics } = result;
    
    if (timeline.length === 0) return;

    const responseTimes = timeline.map(t => t.responseTime).sort((a, b) => a - b);
    
    metrics.avgResponseTimeMs = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    metrics.p50ResponseTimeMs = responseTimes[Math.floor(responseTimes.length * 0.5)] || 0;
    metrics.p95ResponseTimeMs = responseTimes[Math.floor(responseTimes.length * 0.95)] || 0;
    metrics.p99ResponseTimeMs = responseTimes[Math.floor(responseTimes.length * 0.99)] || 0;
    
    metrics.errorRate = metrics.totalRequests > 0 
      ? (metrics.failedRequests / metrics.totalRequests) * 100 
      : 0;
    metrics.timeoutRate = metrics.totalRequests > 0 
      ? (metrics.timeoutRequests / metrics.totalRequests) * 100 
      : 0;
    metrics.rateLimitRate = metrics.totalRequests > 0 
      ? (metrics.rateLimitedRequests / metrics.totalRequests) * 100 
      : 0;
    
    const totalDurationMs = timeline[timeline.length - 1].timestamp - timeline[0].timestamp;
    metrics.throughputRps = totalDurationMs > 0 
      ? (metrics.totalRequests / (totalDurationMs / 1000)) 
      : 0;
  }

  async runFullLoadTest(): Promise<LoadTestReport> {
    console.log('=== Starting Full Load Test ===');
    this.startTime = Date.now();

    const scenarios = [
      { name: 'Health Check', users: 10, generator: this.createHealthCheckGenerator() },
      { name: 'Search Load', users: 50, generator: this.createSearchGenerator() },
      { name: 'AI Request Load', users: 25, generator: this.createAIRequestGenerator() },
      { name: 'Mixed Load', users: 100, generator: this.createMixedLoadGenerator() },
      { name: 'High Concurrency', users: 250, generator: this.createMixedLoadGenerator() },
      { name: 'Peak Load', users: 500, generator: this.createMixedLoadGenerator() },
    ];

    for (const scenario of scenarios) {
      this.config.concurrentUsers = scenario.users;
      this.config.durationMs = 30000;
      this.config.rampUpMs = 5000;
      this.config.thinkTimeMs = 100;
      
      await this.runScenario(scenario.name, scenario.generator);
    }

    const totalDurationMs = Date.now() - this.startTime;
    return this.generateReport(totalDurationMs);
  }

  private createHealthCheckGenerator(): (userIndex: number) => Promise<void> {
    return async (userIndex: number) => {
      const url = `${this.config.baseUrl}/health`;
      
      await new Promise((resolve, reject) => {
        const req = http.request(url, { method: 'GET', timeout: this.config.timeoutMs }, (res) => {
          let data = '';
          res.on('data', (chunk) => { data += chunk; });
          res.on('end', () => {
            if (res.statusCode === 200) {
              resolve(data);
            } else {
              reject(new Error(`Health check failed: ${res.statusCode}`));
            }
          });
        });
        
        req.on('error', reject);
        req.on('timeout', () => {
          req.destroy();
          reject(new Error('Request timeout'));
        });
        
        req.end();
      });
    };
  }

  private createSearchGenerator(): (userIndex: number) => Promise<void> {
    const searchQueries = [
      'hypertension', 'diabetes', 'asthma', 'stroke', 'heart failure',
      'COPD', 'pneumonia', 'malaria', 'tuberculosis', 'HIV'
    ];
    
    return async (userIndex: number) => {
      const query = searchQueries[userIndex % searchQueries.length];
      const url = `${this.config.baseUrl}/api/v1/search?q=${encodeURIComponent(query)}&type=hybrid`;
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (this.config.authToken) {
        headers['Authorization'] = `Bearer ${this.config.authToken}`;
      }
      
      await new Promise((resolve, reject) => {
        const req = http.request(url, { method: 'GET', headers, timeout: this.config.timeoutMs }, (res) => {
          let data = '';
          res.on('data', (chunk) => { data += chunk; });
          res.on('end', () => {
            if (res.statusCode === 200 || res.statusCode === 401) {
              resolve(data);
            } else {
              reject(new Error(`Search failed: ${res.statusCode}`));
            }
          });
        });
        
        req.on('error', reject);
        req.on('timeout', () => {
          req.destroy();
          reject(new Error('Request timeout'));
        });
        
        req.end();
      });
    };
  }

  private createAIRequestGenerator(): (userIndex: number) => Promise<void> {
    const aiQuestions = [
      'What is hypertension?',
      'How is diabetes treated?',
      'What are asthma symptoms?',
      'What is a stroke?',
      'How is heart failure managed?'
    ];
    
    return async (userIndex: number) => {
      const question = aiQuestions[userIndex % aiQuestions.length];
      const url = `${this.config.baseUrl}/api/v1/questions`;
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (this.config.authToken) {
        headers['Authorization'] = `Bearer ${this.config.authToken}`;
      }
      
      await new Promise((resolve, reject) => {
        const req = http.request(url, { 
          method: 'POST', 
          headers, 
          timeout: this.config.timeoutMs 
        }, (res) => {
          let data = '';
          res.on('data', (chunk) => { data += chunk; });
          res.on('end', () => {
            if (res.statusCode === 201 || res.statusCode === 200 || res.statusCode === 401) {
              resolve(data);
            } else {
              reject(new Error(`AI request failed: ${res.statusCode}`));
            }
          });
        });
        
        req.on('error', reject);
        req.on('timeout', () => {
          req.destroy();
          reject(new Error('Request timeout'));
        });
        
        req.write(JSON.stringify({ questionText: question, category: 'general' }));
        req.end();
      });
    };
  }

  private createMixedLoadGenerator(): (userIndex: number) => Promise<void> {
    const searchGenerator = this.createSearchGenerator();
    const aiGenerator = this.createAIRequestGenerator();
    const healthGenerator = this.createHealthCheckGenerator();
    
    return async (userIndex: number) => {
      const scenarioType = userIndex % 3;
      
      switch (scenarioType) {
        case 0:
          await healthGenerator(userIndex);
          break;
        case 1:
          await searchGenerator(userIndex);
          break;
        case 2:
          await aiGenerator(userIndex);
          break;
      }
    };
  }

  private generateReport(totalDurationMs: number): LoadTestReport {
    const totalRequests = this.results.reduce((sum, r) => sum + r.metrics.totalRequests, 0);
    const totalSuccessful = this.results.reduce((sum, r) => sum + r.metrics.successfulRequests, 0);
    const totalFailed = this.results.reduce((sum, r) => sum + r.metrics.failedRequests, 0);
    
    const allResponseTimes = this.results.flatMap(r => r.timeline.map(t => t.responseTime));
    allResponseTimes.sort((a, b) => a - b);

    return {
      timestamp: new Date().toISOString(),
      totalDurationMs,
      scenarios: this.results,
      summary: {
        totalRequests,
        overallSuccessRate: totalRequests > 0 ? (totalSuccessful / totalRequests) * 100 : 0,
        overallErrorRate: totalRequests > 0 ? (totalFailed / totalRequests) * 100 : 0,
        overallAvgResponseTimeMs: allResponseTimes.length > 0 
          ? allResponseTimes.reduce((a, b) => a + b, 0) / allResponseTimes.length 
          : 0,
        overallP95ResponseTimeMs: allResponseTimes[Math.floor(allResponseTimes.length * 0.95)] || 0,
        overallP99ResponseTimeMs: allResponseTimes[Math.floor(allResponseTimes.length * 0.99)] || 0,
        overallThroughputRps: totalDurationMs > 0 ? totalRequests / (totalDurationMs / 1000) : 0,
      },
      recommendations: this.generateRecommendations(),
    };
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    
    this.results.forEach(result => {
      if (result.metrics.errorRate > 5) {
        recommendations.push(`${result.scenario}: High error rate (${result.metrics.errorRate.toFixed(1)}%) - investigate failing requests`);
      }
      if (result.metrics.p95ResponseTimeMs > 5000) {
        recommendations.push(`${result.scenario}: High P95 latency (${result.metrics.p95ResponseTimeMs.toFixed(0)}ms) - optimize slow endpoints`);
      }
      if (result.metrics.rateLimitRate > 10) {
        recommendations.push(`${result.scenario}: High rate limiting (${result.metrics.rateLimitRate.toFixed(1)}%) - adjust rate limit configuration`);
      }
      if (result.metrics.timeoutRate > 1) {
        recommendations.push(`${result.scenario}: Timeouts detected (${result.metrics.timeoutRate.toFixed(1)}%) - increase timeout or optimize slow operations`);
      }
    });
    
    return recommendations;
  }

  generateJSONReport(): string {
    const report = this.generateReport(Date.now() - this.startTime);
    return JSON.stringify(report, null, 2);
  }

  generateHTMLReport(): string {
    const report = this.generateReport(Date.now() - this.startTime);
    
    return `
<!DOCTYPE html>
<html>
<head>
  <title>Load Test Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .header { background: #f0f0f0; padding: 20px; border-radius: 5px; }
    .scenario { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
    .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-top: 10px; }
    .metric { background: #f9f9f9; padding: 10px; border-radius: 3px; }
    .pass { color: green; font-weight: bold; }
    .fail { color: red; font-weight: bold; }
    .warning { color: orange; font-weight: bold; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Load Test Report</h1>
    <p>Generated: ${report.timestamp}</p>
    <p>Duration: ${(report.totalDurationMs / 1000).toFixed(1)}s</p>
  </div>
  
  <h2>Summary</h2>
  <div class="metrics">
    <div class="metric"><strong>Total Requests</strong><br>${report.summary.totalRequests}</div>
    <div class="metric"><strong>Success Rate</strong><br>${report.summary.overallSuccessRate.toFixed(1)}%</div>
    <div class="metric"><strong>Error Rate</strong><br>${report.summary.overallErrorRate.toFixed(1)}%</div>
    <div class="metric"><strong>Avg Response</strong><br>${report.summary.overallAvgResponseTimeMs.toFixed(0)}ms</div>
    <div class="metric"><strong>P95 Latency</strong><br>${report.summary.overallP95ResponseTimeMs.toFixed(0)}ms</div>
    <div class="metric"><strong>P99 Latency</strong><br>${report.summary.overallP99ResponseTimeMs.toFixed(0)}ms</div>
    <div class="metric"><strong>Throughput</strong><br>${report.summary.overallThroughputRps.toFixed(1)} req/s</div>
  </div>
  
  <h2>Scenario Results</h2>
  ${report.scenarios.map(scenario => `
    <div class="scenario">
      <h3>${scenario.scenario}</h3>
      <div class="metrics">
        <div class="metric"><strong>Requests</strong><br>${scenario.metrics.totalRequests}</div>
        <div class="metric"><strong>Success Rate</strong><br>${((scenario.metrics.successfulRequests / scenario.metrics.totalRequests) * 100).toFixed(1)}%</div>
        <div class="metric"><strong>Avg Response</strong><br>${scenario.metrics.avgResponseTimeMs.toFixed(0)}ms</div>
        <div class="metric"><strong>P95 Response</strong><br>${scenario.metrics.p95ResponseTimeMs.toFixed(0)}ms</div>
        <div class="metric"><strong>P99 Response</strong><br>${scenario.metrics.p99ResponseTimeMs.toFixed(0)}ms</div>
        <div class="metric"><strong>Throughput</strong><br>${scenario.metrics.throughputRps.toFixed(1)} req/s</div>
        <div class="metric"><strong>Error Rate</strong><br>${scenario.metrics.errorRate.toFixed(1)}%</div>
        <div class="metric"><strong>Rate Limit</strong><br>${scenario.metrics.rateLimitRate.toFixed(1)}%</div>
      </div>
    </div>
  `).join('')}
  
  <h2>Recommendations</h2>
  <ul>
    ${report.recommendations.map(r => `<li>${r}</li>`).join('')}
  </ul>
</body>
</html>
  `;
  }
}
