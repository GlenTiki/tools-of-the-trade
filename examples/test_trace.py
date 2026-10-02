from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import SimpleSpanProcessor
from opentelemetry.sdk.trace.export.in_memory_span_exporter import InMemorySpanExporter
from trace_example import run


def test_trace_records_retrieval_evidence_without_prompt_text():
    exporter = InMemorySpanExporter()
    provider = TracerProvider()
    provider.add_span_processor(SimpleSpanProcessor(exporter))
    ids = run(provider)
    spans = exporter.get_finished_spans()
    assert len(spans) == 1
    assert spans[0].name == "retrieve"
    assert spans[0].attributes["workshop.result_count"] == len(ids)
    assert "North ward" not in repr(spans[0].attributes)
    provider.shutdown()
