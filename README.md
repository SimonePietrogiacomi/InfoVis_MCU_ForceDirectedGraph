# Visualizzazione delle Informazioni - Progetto finale

Progetto finale di Visualizzazione delle Informazioni, svolto da **Serena Bencivenga** (matricola **??**), **Camilla Bianca** (matricola **461663**) e **Simone Pietrogiacomi** (matricola **461979**), studenti del corso di Laurea Magistrale in Ingegneria Informatica presso l’Università degli studi Roma Tre, a.a. 2018/2019.

## Esplorazione visuale del Marvel Cinematic Universe (MCU)

L’idea su cui si basa il progetto è quella di visualizzare un grafo di eroi e film tramite lo spring embedder di d3.js. Nel dettaglio è già presente una rappresentazione di tale grafo, ma non risulta intuitiva e di facile lettura nonostante fosse realizzata in modo non automatico. Per implementarlo, è stato necessario convertire il file a disposizione, di tipo GraphML, in un file JSON.

Durante la realizzazione del progetto sono stati assegnati i seguenti task, con lo scopo principale di realizzare una visualizzazione più interessante e comprensibile di un grafo force directed:

- Visualizzazione confluent: i nodi con un vicinato simile tra loro sono collegati ad un nodo fittizio. Il vicinato in comune è anch’esso collegato a un nodo fittizio differente. Collegando assieme questi due nodi si ottengono degli archi di tipo “confluent”, che permettono di ridurre il numero di archi che attraversano il grafo e che collegano i due “cluster” di nodi.  

[?disegnino: grafo classico e grafo confluent?]: <>

- Inserimento di archi nascosti per distendere il grafo: i nodi di un cluster sono collegati a tutti i nodi del cluster (o dei cluster) a lui collegato con archi di una lunghezza superiore a quella degli archi già presenti e resi nascosti, per non influire sulla leggibilità del grafo. Lo scopo è quello di allargare la visualizzazione per renderla più intuitiva.

[?disegnino: grafino con cuspidi, grafino con archi nascosti visibili e grafino con archi nascosti nascosti?]: <>

- Inserimento di nodi àncora: tutti i nodi di tipo movies vengono collegati (tramite archi invisibili) ad un nodo fittizio (anch’esso invisibile) sulla sinistra. Lo stesso accade per tutti i nodi di tipo heroes, sulla destra. Lo scopo di questo task è enfatizzare la bipartizione del grafo.

[?disegnino: grafo con archi nascosti nascosti e grafo con ancore?]: <>

- Avvicinamento nodi appartenenti allo stesso cluster: inserimento di archi di lunghezza ridotta tra tutti i nodi all’interno di uno stesso cluster. Lo scopo è avvicinare i nodi con vicinato simile e non sparpagliarli per tutto il grafo.

[?disegnino: grafo con archi cluster distanti, grafo con archi cluster vicini visibili e grafo con archi cluster vicini invisibili?]: <>

Allo scopo di ottenere una migliore visualizzazione, è stata effettuata un’ulteriore sperimentazione unendo gli ultimi due task. Lo scopo è quindi quello di enfatizzare la bipartizione del dataset, facendo in modo che gli archi dello stesso cluster rimangano compatti.

Per evitare ambiguità nella comprensione del grafo è stata introdotta, in tutte le prove eseguite, una funzione aggiuntiva in grado di evidenziare i vicini del nodo selezionato: se si clicca su un eroe, vengono mostrati i film in cui esso compare; se si clicca su un film, vengono visualizzati gli eroi che compaiono in esso.

### Note del progetto

Il dataset fornito rappresenta l’intero MCU, formato da 28 personaggi e 24 film. Al fine di visualizzare un grafo più pulito, si è deciso di utilizzare solamente il dataset relativo alla prima fase, comprensivo di 6 film e 11 eroi.

### Librerie utilizzate

È stata utilizzata la versione 4 di d3.js.

### Sviluppo in locale

Per visualizzare correttamente il progetto, è necessario creare un server locale sulla directory di lavoro. Una volta posizionati nella cartella corrente, eseguire da terminale il comando seguente:
```
python -m SimpleHTTPServer [porta]
```
Dopodiché è necessario aprire il browser e digitare:
```
http://localhost:[porta]
```
Sostituire ```[porta]``` con il numero della porta che si vuole utilizzare. Per esempio:
```
python -m SimpleHTTPServer 8888

http://localhost:8888
```
### Browser testati

Il progetto è stato testato e viene visualizzato correttamente sui seguenti browser:
- Su Windows: **Google Chrome**, versione 75.0.3770.142 (Build ufficiale) (a 64 bit);
- Su Linux: **Mozilla Firefox**, versione 68.0.1 (64 bit).
