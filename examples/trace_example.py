from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import ConsoleSpanExporter, SimpleSpanProcessor
from workshop import retrieve


def run(provider):
    tracer = provider.get_tracer("brightbeam.onboarding")
    with tracer.start_as_current_span("retrieve") as span:
        ids = retrieve("North ward green bin", k=2)
        span.set_attribute("workshop.corpus", "fictional-council-v1")
        span.set_attribute("workshop.result_count", len(ids))
        span.set_attribute("workshop.document_ids", ids)
        return ids


if __name__ == "__main__":
    provider = TracerProvider()
    provider.add_span_processor(SimpleSpanProcessor(ConsoleSpanExporter()))
    run(provider)
    provider.shutdown()
