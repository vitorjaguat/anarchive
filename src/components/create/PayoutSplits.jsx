import { MdPerson } from 'react-icons/md';
import { MdPerson3 } from 'react-icons/md';
import { PiAlienBold } from 'react-icons/pi';
import { useState, useRef } from 'react';

export default function PayoutSplits({
  payoutRecipients,
  setPayoutRecipients,
}) {
  const [selectedDiv, setSelectedDiv] = useState('');
  const percentage1Ref = useRef('50');
  const percentage2Ref = useRef('50');
  const splitAddress1Ref = useRef('');
  const splitAddress2Ref = useRef('');
  const someoneElseAddressRef = useRef();

  const handleClickMe = () => {
    setSelectedDiv('me');
    setPayoutRecipients('me');
  };
  const handleClickSplit = () => {
    setPayoutRecipients([
      {
        address: '',
        percentage: '',
      },
      {
        address: '',
        percentage: '',
      },
    ]);
    setSelectedDiv('split');
  };
  const handleClickSomeoneElse = () => {
    setSelectedDiv('someoneElse');
  };

  const handlePercentageChange1 = () => {
    const percentage1 = percentage1Ref.current.value;
    const percentage2 = 100 - percentage1;
    percentage2Ref.current.value = percentage2;

    updateSplitArr();
  };
  const handlePercentageChange2 = () => {
    const percentage2 = percentage2Ref.current.value;
    const percentage1 = 100 - percentage2;
    percentage1Ref.current.value = percentage1;

    updateSplitArr();
  };

  const updateSplitArr = () => {
    if (splitAddress1Ref.current.value || splitAddress2Ref.current.value) {
      const splitArr = [
        {
          address: splitAddress1Ref.current.value,
          percentage: percentage1Ref.current.value,
        },
        {
          address: splitAddress2Ref.current.value,
          percentage: percentage2Ref.current.value,
        },
      ];
      console.log('splitArr', splitArr);
      setPayoutRecipients(splitArr);
    }
  };

  return (
    <div className='w-full flex flex-col justify-center'>
      <div className=''>Pay out funds to:</div>
      <div className='w-full flex justify-between gap-1'>
        <div
          className={
            'w-1/3 p-3 flex flex-col items-center justify-center bg-white/40 hover:bg-white/60 duration-300 cursor-pointer rounded-md text-sm' +
            (payoutRecipients === 'me'
              ? ' bg-white/60 border-white border-[1px]'
              : '')
          }
          onClick={handleClickMe}
        >
          <div className=''>
            <MdPerson size={30} />
          </div>
          <div className=''>Me</div>
        </div>
        <div
          className={
            'w-1/3 p-3 flex flex-col items-center justify-center bg-white/40 hover:bg-white/60 duration-300 cursor-pointer rounded-md text-sm' +
            (selectedDiv === 'split'
              ? ' bg-white border-white border-[1px]'
              : '')
          }
          onClick={handleClickSplit}
        >
          <div className='flex gap-0'>
            <MdPerson size={30} />
            <MdPerson3 size={30} />
          </div>
          <div className=''>Split</div>
        </div>
        <div
          className={
            'w-1/3 p-3 flex flex-col items-center justify-center bg-white/40 hover:bg-white/60 duration-300 cursor-pointer rounded-md text-sm' +
            (selectedDiv === 'someoneElse'
              ? ' border-zinc-100 border-[1px]'
              : '')
          }
          onClick={handleClickSomeoneElse}
        >
          <div className=''>
            <PiAlienBold size={25} />
          </div>
          <div className='text-center leading-4 mt-1'>Someone else</div>
        </div>
      </div>

      {/* split option: */}
      {selectedDiv === 'split' && (
        <div className='mt-2 w-full h-fit'>
          <div className='w-full flex flex-col gap-1'>
            <div className='w-full flex justify-between items-center'>
              <input
                className='w-[100%] px-2 md:px-4 py-2 rounded-md outline-none  bg-slate-800 text-slate-200'
                type='text'
                name='splitOne'
                id='splitOne'
                placeholder='0x... (address 1)'
                ref={splitAddress1Ref}
                onChange={updateSplitArr}
              />
              <div className='mx-1 leading-3 md:leading-normal md:whitespace-nowrap text-sm'>
                will receive
              </div>
              <input
                className='w-fit md:w-[10%] px-2 md:px-4 py-2 rounded-md outline-none text-center bg-slate-800 text-slate-200'
                type='number'
                name='percentage1'
                id='percentage1'
                min={1}
                max={99}
                defaultValue={50}
                onChange={handlePercentageChange1}
                ref={percentage1Ref}
              />
              %
            </div>
            <div className='w-full flex justify-between items-center'>
              <input
                className='w-[100%] px-2 md:px-4 py-2 rounded-md outline-none bg-slate-800 text-slate-200'
                type='text'
                name='splitTwo'
                id='splitTwo'
                placeholder='0x... (address 2)'
                ref={splitAddress2Ref}
                onChange={updateSplitArr}
              />
              <div className='mx-1 leading-3 md:leading-normal md:whitespace-nowrap text-sm'>
                will receive
              </div>
              <input
                className='w-fit md:w-[10%] px-2 md:px-4 py-2 rounded-md outline-none text-center bg-slate-800 text-slate-200'
                type='number'
                name='percentage2'
                id='percentage2'
                min={1}
                max={99}
                defaultValue={50}
                onChange={handlePercentageChange2}
                ref={percentage2Ref}
              />
              %
            </div>
            <div className='pr-2 md:pr-0 mt-1 w-full flex gap-2 justify-end text-lg'>
              <div className=''>Total:</div>
              <div className='w-[10%] text-right'>100%</div>
            </div>
          </div>
        </div>
      )}

      {selectedDiv === 'someoneElse' && (
        <div className='mt-2 w-full h-fit mb-2'>
          <input
            className='w-[100%] px-2 md:px-4 py-2 rounded-md outline-none  bg-slate-800 text-sm md:text-base text-slate-200'
            type='text'
            name='someoneElse'
            id='someoneElse'
            placeholder='0x... (the address that will receive 100%)'
            ref={someoneElseAddressRef}
            onChange={() =>
              setPayoutRecipients(someoneElseAddressRef.current.value)
            }
          />
        </div>
      )}
    </div>
  );
}
