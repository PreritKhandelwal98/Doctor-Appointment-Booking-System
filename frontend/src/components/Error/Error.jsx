/* eslint-disable react/prop-types */

const Error = ({errorMessage}) => {
  return <div className="flex h-full w-full justify-center items-center">
    <h3 className="text-headingColor text-[20px] leading-[30px] font-semibold ">{errorMessage}</h3>
  </div>
}

export default Error