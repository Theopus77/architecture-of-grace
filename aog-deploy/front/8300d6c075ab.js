
        window.aogPrintConvo = function(){
          try{
            if(window.toolOpen){ window.toolOpen('convostarters'); }
            // toolOpen() writes the modal synchronously, so print inside the user-gesture
            // chain. A timer here is treated as "automatic printing" and blocked on iOS.
            try{ window.print(); }catch(e){}
          }catch(e){}
        };
      