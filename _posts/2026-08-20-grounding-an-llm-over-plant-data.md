---
title: "Grounding an LLM over plant data"
description: "Retrieval quality over industrial documentation is a corpus problem before it is a model problem — and provenance, not fluency, is what makes an answer usable on a factory floor."
date: 2026-08-20
tags: [llm, retrieval, industry]
---

<div lang="en" markdown="1">

Most of what is written about retrieval-augmented generation assumes a benign corpus: clean prose, one authoritative version, no consequence to being wrong. Industrial documentation is none of those things, and the failure modes are correspondingly different. What follows is what actually decided whether a system worked, drawn from designing these systems in process manufacturing. Client and product specifics are under NDA; the reasoning is not.

## Embeddings are bad at the words that matter most

Plant documentation is dense with part numbers, error codes, valve designations and machine-specific abbreviations. These are precisely the tokens an operator's question turns on, and precisely the tokens dense retrieval handles worst — an embedding model has no reason to distinguish two part numbers differing in one digit, because in its training distribution they are near-identical strings with no semantic contrast.

Hybrid retrieval — dense for the paraphrase, lexical for the identifier — is not a marginal improvement here. It is the difference between retrieving the right maintenance section and retrieving a plausible one. If you evaluate only on natural-language questions you will never see this, because your test set will not contain the codes.

## The corpus gate does more for quality than the model does

The instinct when retrieval underperforms is to change the embedding model or the chunking. In practice the larger lever is what is allowed into the corpus at all. A superseded revision of a manual, a draft procedure, a supplier datasheet for a component that was replaced two years ago — each of these retrieves *well* and answers *wrongly*, which is the worst combination available.

So nothing becomes retrievable without human approval, and the approver should not be the uploader. That is a mild organisational cost and it removes an entire class of failure that no amount of model tuning addresses. It also gives you something to point at when someone asks why the system said what it said.

## Let the model propose and something else decide

A language model is genuinely good at estimating which of several candidate actions is informative. It is genuinely bad at being accountable for the choice — not because it chooses poorly, but because the choice leaves no inspectable trace, so a bad outcome cannot be diagnosed and a good one cannot be relied upon.

Splitting the two is cheap: the model generates candidates and scores them, an explicit deterministic layer applies the rules and selects. Now the selection logic is readable, testable and changeable without touching a prompt, and when the behaviour is wrong you can tell whether the generation or the policy was at fault. This is the single design decision I would keep in any system of this kind.

## Provenance is the deliverable, not a feature

In a plant, an answer without a traceable source is not usable — not because people are pedantic, but because the cost of acting on a wrong instruction is measured in production hours or in safety. Fluency is worth nothing here; traceability is worth almost everything.

Concretely: every derived claim carries where it came from, and proposed relations between claims are reviewed by a specialist before they count as established. The system's output is not a chat log. It is a body of attributed, reviewed statements, plus an explicit map of what is *not* covered — which is often the more valuable half, because it identifies the knowledge that currently exists in exactly one person's head.

## Deployment constraints come first, not last

Local inference on owned hardware, read-only integration with control systems, isolated storage. These are usually discussed as hardening, applied to a working system afterwards. They are not. They determine the architecture, they cap throughput in ways that shape the whole operating model, and they are what makes a confidentiality guarantee a property of the system rather than a clause in a contract.

The throughput point is worth stating plainly, because it surprises people: one GPU serves one model, so interviews or sessions serialise. Thirty participants at forty-five minutes each is a scheduling problem, not a scaling parameter. Concurrency is a project.

## Where this meets the classical work

None of this replaces signal processing; it depends on it. A language model over industrial data is only useful once someone has made machine behaviour legible — which is time-series and signal work, not prompt work. An anomaly score becomes actionable when it can be linked to the relevant documentation and the sensors implicated in it. The two halves are the same problem approached from opposite ends: recovering structure from measurement, and making that structure answerable.

</div>

<div lang="de" markdown="1">

Das meiste, was über Retrieval-Augmented Generation geschrieben wird, setzt einen gutartigen Korpus voraus: sauberer Text, eine autoritative Version, keine Folgen bei Fehlern. Industrielle Dokumentation ist nichts davon, und die Fehlermodi sind entsprechend andere. Im Folgenden das, was tatsächlich darüber entschied, ob ein System funktioniert — aus dem Entwurf solcher Systeme in der Prozessfertigung. Kunden- und Produktdetails unterliegen einer Vertraulichkeitsvereinbarung; die Argumentation nicht.

## Embeddings sind schlecht bei genau den Wörtern, auf die es ankommt

Anlagendokumentation ist dicht an Teilenummern, Fehlercodes, Ventilbezeichnungen und maschinenspezifischen Abkürzungen. Genau an diesen Tokens hängt die Frage eines Bedieners, und genau mit ihnen kommt dichtes Retrieval am schlechtesten zurecht — ein Embedding-Modell hat keinen Grund, zwei Teilenummern zu unterscheiden, die sich in einer Ziffer unterscheiden, denn in seiner Trainingsverteilung sind das nahezu identische Zeichenketten ohne semantischen Kontrast.

Hybrides Retrieval — dicht für die Umformulierung, lexikalisch für die Kennung — ist hier keine marginale Verbesserung. Es ist der Unterschied zwischen dem richtigen und einem plausiblen Wartungsabschnitt. Wer nur mit natürlichsprachigen Fragen evaluiert, sieht das nie, weil im Testset die Codes fehlen.

## Das Korpus-Gate bringt mehr als das Modell

Wenn Retrieval schwach ist, liegt der Reflex beim Embedding-Modell oder beim Chunking. Praktisch ist der größere Hebel, was überhaupt in den Korpus gelangt. Eine überholte Revision eines Handbuchs, eine Verfahrensanweisung im Entwurf, ein Lieferantendatenblatt zu einer vor zwei Jahren ersetzten Komponente — jedes davon wird *gut* gefunden und antwortet *falsch*, die schlechteste verfügbare Kombination.

Deshalb wird nichts abrufbar ohne menschliche Freigabe, und die freigebende Person sollte nicht die hochladende sein. Das ist ein geringer organisatorischer Aufwand und beseitigt eine ganze Fehlerklasse, an der kein Modell-Tuning etwas ändert. Zudem hat man etwas, worauf man zeigen kann, wenn gefragt wird, warum das System etwas gesagt hat.

## Das Modell schlägt vor, etwas anderes entscheidet

Ein Sprachmodell kann wirklich gut einschätzen, welche von mehreren Handlungsoptionen informativ ist. Es kann wirklich schlecht für die Wahl verantwortlich sein — nicht weil es schlecht wählte, sondern weil die Wahl keine prüfbare Spur hinterlässt, sodass ein schlechtes Ergebnis nicht diagnostizierbar und ein gutes nicht verlässlich ist.

Die Trennung ist günstig: Das Modell erzeugt Kandidaten und bewertet sie, eine explizite deterministische Schicht wendet die Regeln an und wählt aus. Damit ist die Auswahllogik lesbar, testbar und änderbar, ohne einen Prompt anzufassen, und bei falschem Verhalten lässt sich unterscheiden, ob Generierung oder Policy schuld war. Das ist die eine Entwurfsentscheidung, die ich in jedem System dieser Art beibehalten würde.

## Provenienz ist das Ergebnis, kein Feature

Im Werk ist eine Antwort ohne nachvollziehbare Quelle nicht verwendbar — nicht aus Pedanterie, sondern weil die Kosten einer falschen Anweisung in Produktionsstunden oder in Sicherheit gemessen werden. Sprachliche Eleganz ist hier wertlos, Nachvollziehbarkeit nahezu alles.

Konkret: Jede abgeleitete Aussage trägt ihre Herkunft, und vorgeschlagene Beziehungen zwischen Aussagen werden von einer Fachperson geprüft, bevor sie als belegt gelten. Das Ergebnis ist kein Chatprotokoll, sondern ein Bestand attribuierter, geprüfter Aussagen — samt einer expliziten Karte dessen, was *nicht* abgedeckt ist. Diese Hälfte ist oft die wertvollere, denn sie benennt das Wissen, das heute in genau einem Kopf existiert.

## Deployment-Randbedingungen zuerst, nicht zuletzt

Lokale Inferenz auf eigener Hardware, rein lesende Anbindung an Leitsysteme, isolierte Speicherung. Das wird meist als Härtung behandelt, die man nachträglich auf ein laufendes System legt. Ist es nicht. Es bestimmt die Architektur, begrenzt den Durchsatz in einer Weise, die das gesamte Betriebsmodell prägt, und macht eine Vertraulichkeitszusage zu einer Eigenschaft des Systems statt zu einer Vertragsklausel.

Der Durchsatzpunkt sei deutlich gesagt, weil er überrascht: Eine GPU bedient ein Modell, Sitzungen serialisieren also. Dreißig Teilnehmende à fünfundvierzig Minuten sind ein Terminplanungsproblem, kein Skalierungsparameter. Concurrency ist ein Projekt.

## Wo das auf die klassische Arbeit trifft

Nichts davon ersetzt Signalverarbeitung; es setzt sie voraus. Ein Sprachmodell über Industriedaten ist erst nützlich, wenn jemand das Maschinenverhalten lesbar gemacht hat — das ist Zeitreihen- und Signalarbeit, keine Prompt-Arbeit. Ein Anomalie-Score wird handlungsfähig, wenn er mit der zugehörigen Dokumentation und den betroffenen Sensoren verknüpft werden kann. Beide Hälften sind dasselbe Problem von entgegengesetzten Enden: Struktur aus Messung gewinnen und diese Struktur auskunftsfähig machen.

</div>
