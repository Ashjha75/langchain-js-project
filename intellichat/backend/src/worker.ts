/**
 * Worker Entry Point
 * Initializes and starts the document processing worker.
 */

import { workerService } from './services/worker';

workerService.start();
