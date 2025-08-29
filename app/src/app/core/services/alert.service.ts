import { Injectable } from '@angular/core';
import Swal, { SweetAlertIcon } from 'sweetalert2';

@Injectable({ providedIn: 'root' })
export class AlertService {
  success(message: string, title: string = '¡Éxito!') {
    return Swal.fire(title, message, 'success');
  }

  successWithAutoClose(message: string, title: string = '¡Éxito!', autoCloseTime: number = 1500) {
    return Swal.fire({
      title,
      text: message,
      icon: 'success',
      timer: autoCloseTime,
      showConfirmButton: false,
      timerProgressBar: true
    });
  }

  error(message: string, title: string = '¡Error!') {
    return Swal.fire(title, message, 'error');
  }

  info(message: string, title: string = 'Información') {
    return Swal.fire(title, message, 'info');
  }

  warning(message: string, title: string = 'Advertencia') {
    return Swal.fire(title, message, 'warning');
  }

  confirm(
    text: string,
    title: string = 'Confirmación',
    confirmButtonText: string = 'Sí',
    cancelButtonText: string = 'Cancelar',
    icon: SweetAlertIcon = 'question'
  ): Promise<boolean> {
    return Swal.fire({
      title,
      text,
      icon,
      showCancelButton: true,
      confirmButtonText,
      cancelButtonText,
      reverseButtons: true,
      focusCancel: true
    }).then(result => result.isConfirmed === true);
  }
}


