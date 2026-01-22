interface Message {
  id: string;
  text: string;
  sender: string;
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