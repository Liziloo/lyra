interface Message {
  id: string;
  text: string;
  role: string;
  timestamp: Date;
}

interface Provider{
    id: string;
    name: string;
    url: string;
    apiKey: string
}

interface Thread {
  id: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export type { Message, Provider, Thread };