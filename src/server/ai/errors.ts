export class AiQuotaError extends Error {
  constructor(
    message = "La quota gratuita di intelligenza artificiale per oggi e' esaurita. Riprova domani oppure inserisci la spesa a mano.",
  ) {
    super(message);
    this.name = "AiQuotaError";
  }
}

export class AiLimitError extends Error {
  constructor(
    public readonly limit: number,
    message = `Hai raggiunto il limite di ${limit} scansioni per oggi. Riprova domani oppure inserisci la spesa a mano.`,
  ) {
    super(message);
    this.name = "AiLimitError";
  }
}

export class AiUnavailableError extends Error {
  constructor(
    message = "Il servizio di lettura non e' disponibile al momento. Riprova tra poco.",
  ) {
    super(message);
    this.name = "AiUnavailableError";
  }
}

export class AiTimeoutError extends Error {
  constructor(message = "La lettura ha impiegato troppo tempo. Riprova.") {
    super(message);
    this.name = "AiTimeoutError";
  }
}

export class AiParseError extends Error {
  constructor(
    message = "Non sono riuscito a leggere la risposta del modello.",
  ) {
    super(message);
    this.name = "AiParseError";
  }
}
