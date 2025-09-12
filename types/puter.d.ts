declare global {
  interface Window {
    Puter: {
      ai: {
        embed(
          text: string,
          options?: { model?: string }
        ): Promise<{ embedding: number[] }>;

        generateText(
          prompt: string,
          options?: { model?: string; max_tokens?: number }
        ): Promise<{ output: string }>;
      };
    };
  }

  const Puter: Window["Puter"];
}

export {};
