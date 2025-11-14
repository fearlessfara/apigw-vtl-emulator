import { Modal, ModalBody, Accordion, AccordionItem, AccordionHeader, AccordionBody } from './ui';

function HelpModal({ show, onHide }) {
  return (
    <Modal show={show} onHide={onHide} size="lg" title={
      <>
        <i className="bi bi-question-circle"></i>VTL Emulator Help
      </>
    }>
      <ModalBody>
        <Accordion defaultActiveKey="0">
          <AccordionItem eventKey="0">
            <AccordionHeader>Getting Started</AccordionHeader>
            <AccordionBody>
              <p>Welcome to VTL Emulator! This tool helps you test and debug Apache Velocity
                Template Language (VTL) templates for AWS API Gateway.</p>
              <ol>
                <li>Write your VTL template in the <strong>Template</strong> tab</li>
                <li>Configure your input data in the <strong>Body</strong> tab</li>
                <li>Set up variables in the <strong>Variables</strong> tab</li>
                <li>Click <strong>Render</strong> to see the output</li>
              </ol>
            </AccordionBody>
          </AccordionItem>
          <AccordionItem eventKey="1">
            <AccordionHeader>Keyboard Shortcuts</AccordionHeader>
            <AccordionBody>
              <ul>
                <li><kbd>Ctrl + Enter</kbd> - Render template</li>
                <li><kbd>Ctrl + Space</kbd> - Show autocomplete</li>
                <li><kbd>Ctrl + F</kbd> - Find in editor</li>
                <li><kbd>Ctrl + H</kbd> - Find and replace</li>
                <li><kbd>Ctrl + S</kbd> - Export configuration</li>
                <li><kbd>F11</kbd> - Toggle fullscreen</li>
              </ul>
            </AccordionBody>
          </AccordionItem>
        </Accordion>
      </ModalBody>
    </Modal>
  );
}

export default HelpModal;

