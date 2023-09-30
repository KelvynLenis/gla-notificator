import { useEffect, useState } from 'react';
// import notificationSound from '../assets/notification.mp3';
import { api } from '../lib/axios';
import dayjs from 'dayjs';

// const islandEventTimes = [
//   '00:06', '00:36', '01:06', '01:36', '02:06', 
//   '02:36', '03:06', '03:36', '04:06', '04:36', 
//   '05:06', '05:36', '06:06', '06:36', '07:06', 
//   '07:36', '08:06', '08:36', '09:06', '09:36', 
//   '10:06', '10:36', '11:06', '11:36', '12:06', 
//   '12:36', '13:06', '13:36', '14:06', '14:36', 
//   '15:06', '15:36', '16:06', '16:36', '17:06', 
//   '17:36', '18:06', '18:36', '19:06', '19:36', 
//   '20:06', '20:36', '21:06', '21:36', '22:06', 
//   '22:36', '23:06', '23:36'
// ];

// const wantedPirateTimes = [
//   '00:36', '02:36', '04:36', '06:36', '08:36', 
//   '10:36', '12:36', '14:36', '16:36', '18:36', 
//   '20:36', '22:36'
// ];

let subscription: any = undefined;

navigator.serviceWorker.register('service-worker.js')
    .then(async serviceWorker => {
      let sub = await serviceWorker.pushManager.getSubscription();

      if(!sub) {
        const publicKeyResponse = await api.get('/public-key')

        sub = await serviceWorker.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: publicKeyResponse.data.publicKey,
        })
      console.log(sub)
    }
      
      console.log(sub)
      subscription = sub;

      await api.post('/subscribe', {
        sub,
      })
    })

function Notificator() {
  const [isIslandEventActive, setIsIslandEventActive] = useState(false);
  const [isWantedPirateActive, setIsWantedPirateActive] = useState(false);
  const [nextIslandEvent, setNextIslandEvent] = useState<string>('');
  const [nextWantedPirate, setNextWantedPirate] = useState<string>('');
  
  // const audio = new Audio(notificationSound);


  async function unsubscribeIslandEvent() {
    await api.post('/unsubscribe-island');
    setNextIslandEvent('');
  }

  async function unsubscribeWantedPirate() {
    await api.post('/unsubscribe-wanted-pirate');
    setNextWantedPirate('');
  }

  // async function scheduleIslandNotification() {
  //   const now = dayjs().format('HH:mm');
  //   console.log(subscription)
  //   const response = await api.post('/schedule-island-notification', { subscription, now });
  //   // setNextIslandEvent(response.data.nextNotification);
  //   console.log(response.data)
  // }

  // async function scheduleWantedPirateNotification() {
  //   const now = dayjs().format('HH:mm');
  //   const response = await api.post('/schedule-wanted-pirate-notification', { subscription, now });
  //   setNextWantedPirate(response.data.nextWantedPirate);
  // }

  async function scheduleAllEvents(){
    const now = dayjs()
    const hour = now.hour() > 10 ? now.hour() : `0${now.hour()}`
    const minute = now.minute() > 10 ? now.minute() : `0${now.minute()}`
    const nowString = `${hour}:${minute}`
    console.log(nowString)
    const response = await api.post('/schedule-all-events', { subscription , nowString });
    console.log(response.data.events)
  }

  async function scheduleAllWP() {
    const now = dayjs()
    const hour = now.hour() > 10 ? now.hour() : `0${now.hour()}`
    const minute = now.minute() > 10 ? now.minute() : `0${now.minute()}`
    const nowString = `${hour}:${minute}`

    const response = await api.post('/schedule-all-wp', { subscription, nowString });
    console.log(response.data.wp)
  }

  function requestPermission() {
    Notification.requestPermission()
  }

  // async function getNextIslandEvent() {
  //   const response = await api.get('/next-island-event');
  //   setNextIslandEvent(response.data.nextIslandEvent);
  // }

  // async function getNextWantedPirate() {
  //   const response = await api.get('/next-wanted-pirate');
  //   setNextWantedPirate(response.data.nextWantedPirate);
  // }


  useEffect(() => {    
    requestPermission();
  }, [])
  

  useEffect(() => {
    if(isIslandEventActive){
      // scheduleIslandNotification();
      scheduleAllEvents();
    }

    if(!isIslandEventActive){
      unsubscribeIslandEvent();
    }

    if(isWantedPirateActive){
      // scheduleWantedPirateNotification();
      scheduleAllWP();
    }

    if(!isWantedPirateActive){
      unsubscribeWantedPirate();
    }
  }, [isIslandEventActive, isWantedPirateActive])


  return (
    <div className="w-screen flex flex-col items-start justify-center gap-2 text-xl px-4">
      <div className="flex justify-center gap-2 w-full">
        <span aria-checked={isIslandEventActive} className='w-28 bg-zinc-800 border border-yellow-500 rounded-md px-1 aria-checked:bg-yellow-500 aria-checked:text-black aria-checked:border-yellow-300 font-bold'>{isIslandEventActive ? 'On' : 'Off'}</span>
        <button className="w-80 h-full bg-black border border-yellow-300 rounded-md hover:bg-yellow-300 hover:border-black hover:text-black aria-checked:border-yellow-300 min-[440px]:w-8/12 min-[760px]:w-72 min-[760px]:text-2xl" onClick={() => setIsIslandEventActive(!isIslandEventActive)}>Acionar Alerta de Island Event</button>
      </div>
      <div className="flex justify-center gap-2 w-full">
        <span aria-checked={isWantedPirateActive} className='w-28 bg-zinc-800 border border-yellow-500 rounded-md px-1 aria-checked:bg-yellow-500 aria-checked:text-black font-bold'>{isWantedPirateActive ? 'On' : 'Off'}</span>
        <button className="w-80 px-1 h-full bg-black border border-yellow-300 rounded-md hover:bg-yellow-300 hover:border-black hover:text-black aria-checked:border-yellow-300 min-[440px]:w-8/12 min-[760px]:w-72 min-[760px]:text-2xl" onClick={() => setIsWantedPirateActive(!isWantedPirateActive)}>Acionar Alerta de Wanted Pirate</button>
      </div>
      <div className='w-full flex items-center justify-center gap-5'>
        <div className='flex flex-col w-fit items-center gap-4 mt-2'>
          <span className='font-bold bg-zinc-900 px-3 rounded-md min-[760px]:w-48 min-[760px]:text-2xl'>Próximo evento de ilha: </span>
          <span aria-checked={nextIslandEvent?.length === 0} className='flex w-fit bg-zinc-900 rounded-full px-3 py-1 aria-checked:hidden'>{nextIslandEvent}</span>
        </div>
        <div className='w-fit flex flex-col items-center gap-4 mt-2'>
          <span className='font-bold bg-zinc-900 px-3 rounded-md min-[760px]:w-48 min-[760px]:text-2xl'>Próximo Wanted Pirate: </span>
          <span aria-checked={nextWantedPirate?.length === 0} className='flex w-fit bg-zinc-900 rounded-full px-3 py-1 aria-checked:hidden'>{nextWantedPirate}</span>
        </div>
      </div>
      {/* <div className='w-full flex items-center justify-center'>
        <span className='flex w-fit bg-zinc-900 rounded-full px-3 py-1'>Notificações: {notificationsCount}</span>
      </div> */}
      
      {/* <div className="flex gap-2">
        <input className="w-28 text-base bg-zinc-900 rounded-lg p-1 border border-yellow-300 " value={time} onChange={e => setTime(e.target.value)} type="time" />
        <button className="w-80 h-full bg-black border border-yellow-300 rounded-md hover:bg-yellow-300 hover:border-black hover:text-black" onClick={activateCustom}>Acionar Alerta Customizado</button>
      </div> */}
    </div>
  )
}

export default Notificator