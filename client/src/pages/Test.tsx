import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';

function Test() {
  return (
    <div>
      <InputText placeholder="Enter text" />
      <Button label="Submit" className="p-button-success" />
    </div>
  );
}

export default Test;