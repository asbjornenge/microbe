import { send }   from 'micro'
import Prometheus from 'prometheus-client'

const logs = []
const metricsClient = new Prometheus()

function microbe(defaultHandler) {
    return async function _microbe(req, res) {
        switch(req.url) {
            case '/logs':
                return send(res, 200, logs)
            case '/meta':
                return send(res, 200, 'meta')
            case '/metrics':
                return metricsClient.metricsFunc()(req, res)
        }
        defaultHandler(req, res)
    }
}

class MetricsGauge {
    constructor(config) {
        this.config = config
        this.gauge  = metricsClient.newGauge(config)
        this.value  = 0
    }
    add(amount) {
        this.value += amount
    }
    subtract(amount) {
        this.value -= amount
    }
    set(value) {
        this.value = value
    }
    setProm() {
        // TODO calc period (20 sec)
       this.gauge.set({ period: "20sec" }, this.value) 
    }
    reset() {
        this.value = 0
    }
}

let _metrics = {
    gauges : {}
}
let metrics  = {
    gauge    : (config) => {  
        let gauge = new MetricsGauge(config) 
        _metrics.gauges[config.namespace+config.name] = gauge
        return gauge 
    },
    counter  : (config) => { metricsClient.newCounter(config) },
    collect  : (interval=20000) => {
        setInterval(collectGaugeMetrics, interval)
    }
}
let collectGaugeMetrics = () => {
    Object.keys(_metrics.gauges).forEach(g => {
        let gauge = _metrics.gauges[g]
        gauge.setProm()
        gauge.reset()
    })
}

export { microbe as default, metrics }
