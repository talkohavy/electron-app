import Versions from '@renderer/components/Versions';
import ClockPanel from './content/ClockPanel';
import CounterPanel from './content/CounterPanel';
import DialogPanel from './content/DialogPanel';
import SystemPanel from './content/SystemPanel';

export default function HomePage() {
  return (
    <div className='mx-auto flex w-full max-w-3xl flex-col items-center gap-6 p-6 md:p-8'>
      <div className='text-center'>
        <h1 className='text-2xl font-extrabold text-gray-900 dark:text-white select-all'>Type-Safe IPC Demo</h1>

        <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
          Every call below goes through the shared schema in one type-safe path.
        </p>
      </div>

      <div className='grid w-full grid-cols-1 gap-4 sm:grid-cols-2'>
        <SystemPanel />
        <DialogPanel />
        <CounterPanel />
        <ClockPanel />
      </div>

      <Versions />
    </div>
  );
}
