export function ErrorMessage({ 
  error
} : {
  error: Error
}){

return (
  <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
    {error.message}
  </div>

)}