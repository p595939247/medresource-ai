export interface Node {
  id: string;
  group: number;
  label: string;
}

export interface Link {
  source: string;
  target: string;
  value: number;
}

export interface TrainingData {
  episode: number;
  ppo: number;
  dqn: number;
  ddqn: number;
}

export interface PatientFlow {
  time: string;
  arrival: number;
  processed: number;
  waiting: number;
}

export interface SimulationData {
  network: {
    nodes: Node[];
    links: Link[];
  };
  trainingResults: TrainingData[];
  patientFlow: PatientFlow[];
}
