"use strict";

const Long = require("long");
const DatadogSpanContext = require("../span_context");

class TextMapPropagator {
  inject(spanContext, carrier) {
    Object.assign(carrier, {
      "ot-tracer-traceid": spanContext.traceId.toString(16),
      "ot-tracer-spanid": spanContext.spanId.toString(16),
      "ot-tracer-sampled": String(spanContext.sampled)
    });

    spanContext.baggageItems &&
      Object.keys(spanContext.baggageItems).forEach(key => {
        carrier[`ot-baggage-${key}`] = JSON.stringify(
          spanContext.baggageItems[key]
        );
      });
  }

  extract(carrier) {
    const baggageItems = {};

    try {
      Object.keys(carrier).forEach(key => {
        const match = key.match(/^ot-baggage-(.+)$/);

        if (match) {
          baggageItems[match[1]] = JSON.parse(carrier[key]);
        }
      });

      return new DatadogSpanContext({
        traceId: Long.fromString(carrier["ot-tracer-traceid"], true),
        spanId: Long.fromString(carrier["ot-tracer-spanid"], true),
        sampled: JSON.parse(carrier["ot-tracer-sampled"]),
        baggageItems
      });
    } catch (e) {
      return null;
    }
  }
}

module.exports = TextMapPropagator;
