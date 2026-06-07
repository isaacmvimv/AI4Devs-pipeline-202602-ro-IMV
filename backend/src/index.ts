import { createApp } from './app';

const app = createApp();
const port = 3010;

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
