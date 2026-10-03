# Fictional product procedure assistant

The user is a support adviser. They need to find the current approved procedure for a specified product and division. The business outcome is a verifiable answer with a source reference. The current baseline and success threshold have not been measured.

Use one web interface and one application service. The service validates the division and product, filters permitted documents, retrieves evidence and asks a model to draft a cited response. Retrieval, routing and model calls are internal components of the service. No persistent database or asynchronous queue is required for this first draft.

The Retail and Business divisions maintain separate approved product handbooks. The product owner decides which revision is authoritative. A request for a Retail procedure must never use a Business source. If the division is absent, ask for clarification. If authoritative sources conflict, return the case to a named human reviewer. The review owner remains to be assigned.

Input fields are question, division and product. Treat them as internal information. The output contains a draft answer, source references and a flag that indicates whether human review is required.

An acceptance case asks for a Retail reset procedure while a similar Business procedure is also present. The passing result cites only the applicable Retail source. A Business citation fails the case. Create checks for source filtering, missing division and conflicting authority. The dataset needs independent expert review and a held-out split. Evidence has not yet been collected.

The release owner must confirm the source-conflict policy and review the test results. No release is approved by this specification.
