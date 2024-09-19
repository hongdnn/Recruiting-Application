import express  from 'express';

import { loader } from './loaders/index'
import { PORT } from './environment'
import { initFirebase } from './firebase';

async function startServer() {
    const app = express()
    await loader({ expressApp: app })
    initFirebase()
    app.listen(PORT, () => console.log(`Your server is ready`))
}

startServer();