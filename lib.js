'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.metrics = exports.default = undefined;

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _micro = require('micro');

var _prometheusClient = require('prometheus-client');

var _prometheusClient2 = _interopRequireDefault(_prometheusClient);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var logs = [];
var metricsClient = new _prometheusClient2.default();

function microbe(defaultHandler) {
    return function () {
        var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(req, res) {
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            _context.t0 = req.url;
                            _context.next = _context.t0 === '/logs' ? 3 : _context.t0 === '/meta' ? 4 : _context.t0 === '/metrics' ? 5 : 6;
                            break;

                        case 3:
                            return _context.abrupt('return', (0, _micro.send)(res, 200, logs));

                        case 4:
                            return _context.abrupt('return', (0, _micro.send)(res, 200, 'meta'));

                        case 5:
                            return _context.abrupt('return', metricsClient.metricsFunc()(req, res));

                        case 6:
                            defaultHandler(req, res);

                        case 7:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this);
        }));
        return function _microbe(_x, _x2) {
            return ref.apply(this, arguments);
        };
    }();
}

var MetricsGauge = function () {
    function MetricsGauge(config) {
        (0, _classCallCheck3.default)(this, MetricsGauge);

        this.config = config;
        this.gauge = metricsClient.newGauge(config);
        this.value = 0;
    }

    (0, _createClass3.default)(MetricsGauge, [{
        key: 'add',
        value: function add(amount) {
            this.value += amount;
        }
    }, {
        key: 'subtract',
        value: function subtract(amount) {
            this.value -= amount;
        }
    }, {
        key: 'set',
        value: function set(value) {
            this.value = value;
        }
    }, {
        key: 'setProm',
        value: function setProm() {
            // TODO calc period (20 sec)
            this.gauge.set({ period: "20sec" }, this.value);
        }
    }, {
        key: 'reset',
        value: function reset() {
            this.value = 0;
        }
    }]);
    return MetricsGauge;
}();

var _metrics = {
    gauges: {}
};
var metrics = {
    gauge: function gauge(config) {
        var gauge = new MetricsGauge(config);
        _metrics.gauges[config.namespace + config.name] = gauge;
        return gauge;
    },
    counter: function counter(config) {
        metricsClient.newCounter(config);
    },
    collect: function collect() {
        var interval = arguments.length <= 0 || arguments[0] === undefined ? 20000 : arguments[0];

        setInterval(collectGaugeMetrics, interval);
    }
};
var collectGaugeMetrics = function collectGaugeMetrics() {
    (0, _keys2.default)(_metrics.gauges).forEach(function (g) {
        var gauge = _metrics.gauges[g];
        gauge.setProm();
        gauge.reset();
    });
};

exports.default = microbe;
exports.metrics = metrics;

