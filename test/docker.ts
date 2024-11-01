import Docker from 'dockerode';

const docker = new Docker();

let container: Docker.Container | undefined;

/**
 * Interface representing the progress detail of a Docker operation.
 */
interface DockerProgressDetail {
  current?: number;
  total?: number;
}

/**
 * Interface representing a Docker progress event.
 */
interface DockerProgressEvent {
  status?: string;
  id?: string;
  progress?: string;
  progressDetail?: DockerProgressDetail;
}

// Progress handler function with proper typing
function onProgress(event: DockerProgressEvent) {
  if (event.status) {
    let logMessage = event.status;
    if (event.id) {
      logMessage = `[${event.id}] ${logMessage}`;
    }
    if (event.progress) {
      logMessage += ` ${event.progress}`;
    }
    console.log(logMessage);
  }
}

/**
 * Downloads the DynamoDB Local Docker image if necessary and starts a container on the specified port.
 *
 * @param port - The port on which to run the DynamoDB Local container.
 */
export const setupDynamoDbLocal = async (port: number) => {
  // Pull the DynamoDB Local image if not already available
  await new Promise<void>((resolve, reject) => {
    console.log('Pulling DynamoDB Local image...');
    void docker.pull(
      'amazon/dynamodb-local',
      (err: Error | undefined, stream: NodeJS.ReadableStream) => {
        if (err) {
          reject(err);
          return;
        }

        docker.modem.followProgress(
          stream,
          (pullErr: Error | null) => {
            if (pullErr) {
              console.error('Error pulling image:', pullErr);
              reject(pullErr);
            } else {
              console.log('Successfully pulled DynamoDB Local image.');
              resolve();
            }
          },
          onProgress, // Progress handler function with proper typing
        );
      },
    );
  });

  // Create and start the DynamoDB Local container
  console.log('Creating DynamoDB Local container...');
  container = await docker.createContainer({
    Image: 'amazon/dynamodb-local',
    ExposedPorts: { '8000/tcp': {} },
    HostConfig: {
      PortBindings: { '8000/tcp': [{ HostPort: port.toString() }] },
    },
  });

  await container.start();
  console.log('DynamoDB Local container started.');
};

export const teardownDynamoDbLocal = async () => {
  if (container) {
    await container.stop();
    await container.remove();

    console.log('DynamoDB Local container stopped and removed.');
  }
};
