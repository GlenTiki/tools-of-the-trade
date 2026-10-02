import pytest
from pydantic import ValidationError
from workshop import DOCUMENTS, GOLDEN, Answer, evaluate, fuse, retrieve, validate_citations, wilson


def test_retriever_finds_the_labelled_passage():
    for case in GOLDEN:
        assert case["expected_ids"] <= set(retrieve(case["question"], k=2))


def test_retrieval_metrics_use_all_relevant_passages():
    cases = [{"question": "synthetic", "expected_ids": {"a", "b"}}]
    result = evaluate(cases, lambda query, k: ["a"])
    assert result == {"questions": 1, "hit_rate_at_2": 1.0, "recall_at_2": 0.5}


def test_missing_passage_makes_the_regression_gate_red():
    result = evaluate(GOLDEN, lambda query, k: [])
    assert result["hit_rate_at_2"] == 0.0
    assert result["recall_at_2"] == 0.0


def test_no_denominator_does_not_become_a_perfect_score():
    with pytest.raises(ValueError):
        evaluate([], retrieve)
    with pytest.raises(ValueError):
        evaluate([{"question": "none", "expected_ids": set()}], retrieve)


def test_schema_requires_real_booleans_and_rejects_extra_fields():
    with pytest.raises(ValidationError):
        Answer(answer="Monday", citations=["bins-north"], answerable="yes")
    with pytest.raises(ValidationError):
        Answer(answer="Monday", citations=["bins-north"], answerable=True, invented=1)


def test_unknown_or_missing_citations_fail():
    for citations in [[], ["invented-source"]]:
        answer = Answer(answer="Monday", citations=citations, answerable=True)
        with pytest.raises(ValueError):
            validate_citations(answer, {"bins-north"})


def test_valid_citation_is_not_a_truth_test():
    answer = Answer(answer="Every Friday", citations=["bins-north"], answerable=True)
    validate_citations(answer, {"bins-north"})
    assert "Monday" in DOCUMENTS["bins-north"]


def test_refusal_can_have_no_citation():
    answer = Answer(answer="The supplied documents do not say.", citations=[], answerable=False)
    validate_citations(answer, set())


def test_fusion_does_not_count_duplicate_ids_within_one_ranking():
    assert fuse(["a", "a"], ["b", "a"]) == fuse(["a"], ["b", "a"])
    assert fuse(["a", "b"], ["b", "a"])[0][1] == pytest.approx(1 / 61 + 1 / 62)


def test_wilson_interval_matches_worked_example():
    low, high = wilson(16, 20)
    assert low == pytest.approx(0.584, abs=0.001)
    assert high == pytest.approx(0.919, abs=0.001)
    with pytest.raises(ValueError):
        wilson(0, 0)
