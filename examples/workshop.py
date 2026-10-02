from math import sqrt

from pydantic import BaseModel, ConfigDict
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics import confusion_matrix, precision_score, recall_score
from sklearn.metrics.pairwise import cosine_similarity

DOCUMENTS = {
    "bins-north": "North ward: green bins are collected every Monday.",
    "bins-south": "South ward: green bins are collected every Thursday.",
    "planning": "For a planning application, submit the form and a site map.",
    "missed-bin": "Report a missed bin collection using the council contact form.",
}
GOLDEN = [
    {"question": "When is green bin collection in North ward?", "expected_ids": {"bins-north"}},
    {"question": "When is green bin collection in South ward?", "expected_ids": {"bins-south"}},
    {"question": "What do I submit with a planning application?", "expected_ids": {"planning"}},
    {"question": "How do I report a missed bin collection?", "expected_ids": {"missed-bin"}},
]


def retrieve(query, k=2):
    ids = list(DOCUMENTS)
    vectorizer = TfidfVectorizer(ngram_range=(1, 2))
    matrix = vectorizer.fit_transform(DOCUMENTS.values())
    scores = cosine_similarity(vectorizer.transform([query]), matrix)[0]
    ranking = sorted(range(len(ids)), key=lambda index: (-scores[index], ids[index]))
    return [ids[index] for index in ranking[:k]]


def evaluate(cases, search):
    if not cases or any(not case["expected_ids"] for case in cases):
        raise ValueError("Use non-empty, answerable retrieval cases.")
    hits, recalls = [], []
    for case in cases:
        expected = case["expected_ids"]
        found = set(search(case["question"], k=2)) & expected
        hits.append(bool(found))
        recalls.append(len(found) / len(expected))
    return {
        "questions": len(cases),
        "hit_rate_at_2": sum(hits) / len(hits),
        "recall_at_2": sum(recalls) / len(recalls),
    }


def fuse(*rankings, constant=60):
    scores = {}
    for ranking in rankings:
        for rank, item in enumerate(dict.fromkeys(ranking), start=1):
            scores[item] = scores.get(item, 0.0) + 1 / (constant + rank)
    return sorted(scores.items(), key=lambda item: (-item[1], item[0]))


class Answer(BaseModel):
    model_config = ConfigDict(strict=True, extra="forbid")
    answer: str
    citations: list[str]
    answerable: bool


def validate_citations(answer, supplied_ids):
    if answer.answerable and not answer.citations:
        raise ValueError("An answer needs a source.")
    if not set(answer.citations) <= supplied_ids:
        raise ValueError("The answer cites an unsupplied source.")


def wilson(successes, total, z=1.96):
    if total <= 0 or not 0 <= successes <= total:
        raise ValueError("Use 0 <= successes <= total and total > 0.")
    p = successes / total
    denominator = 1 + z * z / total
    centre = (p + z * z / (2 * total)) / denominator
    radius = z * sqrt(p * (1 - p) / total + z * z / (4 * total * total)) / denominator
    return centre - radius, centre + radius


def classification_example():
    truth = [1] * 10 + [0] * 10
    predicted = [1] * 8 + [0] * 2 + [1] * 4 + [0] * 6
    print(confusion_matrix(truth, predicted, labels=[0, 1]))
    print(f"Precision: {precision_score(truth, predicted):.3f}")
    print(f"Recall: {recall_score(truth, predicted):.3f}")


if __name__ == "__main__":
    print(evaluate(GOLDEN, retrieve))
    classification_example()
    print("Wilson interval, 16/20:", wilson(16, 20))
