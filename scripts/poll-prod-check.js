// Polls the prod health endpoint until it returns 200 or max attempts reached
const [,, url] = process.argv
const attempts = parseInt(process.env.ATTEMPTS || '12', 10)
const intervalMs = parseInt(process.env.INTERVAL || '15', 10) * 1000

if (!url) {
  console.error('Usage: node scripts/poll-prod-check.js <url>')
  process.exit(1)
}

async function check(){
  try {
    const res = await fetch(url, { cache: 'no-store' })
    const text = await res.text()
    console.log(new Date().toISOString(), 'status', res.status)
    if (res.status === 200) {
      console.log('Endpoint is live')
      console.log(text.slice(0, 2000))
      process.exit(0)
    }
  } catch (err) {
    console.error(new Date().toISOString(), 'fetch error', err.message)
  }
}

(async function(){
  for (let i=1;i<=attempts;i++){
    console.log(`Attempt ${i}/${attempts}`)
    await check()
    if (i !== attempts) await new Promise(r=>setTimeout(r, intervalMs))
  }
  console.error('Timed out waiting for endpoint')
  process.exit(2)
})()
