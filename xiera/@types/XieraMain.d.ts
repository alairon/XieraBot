
export interface XieraConfig {
  xiera: {
    token: string,
    flags: string 
  },
  data: {
    url: string,
    options: object,
    refreshInterval: number
  }
}

export interface XieraString {
  client: {
    login: {
      error: string
    },
    on: {
      ready: string,
      rateLimit: string,
      warn: string,
      error: string,
      shardError: string,
      shardReconnecting: string,
      shardResume: string,
      unhandledRejection: string
    },
    message: {
      default: string,
      usage: {
        greetingA: string,
        greetingB: string,
        instructions: string,
        instructionsDM: string,
        instructionsUQ: string,
        instructionsCasino: string,
        instructionsReset: string,
        instructionsDC: string
      }
    }
  }
}