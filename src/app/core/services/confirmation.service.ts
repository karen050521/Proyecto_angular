import { Injectable, ViewContainerRef, ComponentRef, inject, ApplicationRef, createComponent, EnvironmentInjector } from '@angular/core';
import { ConfirmationModalComponent, ConfirmationConfig } from '../../shared/components/confirmation-modal/confirmation-modal';

@Injectable({
  providedIn: 'root'
})
export class ConfirmationService {
  private appRef = inject(ApplicationRef);
  private injector = inject(EnvironmentInjector);
  private modalComponentRef: ComponentRef<ConfirmationModalComponent> | null = null;

  /**
   * Muestra un modal de confirmación y retorna una promesa
   * @param config Configuración del modal
   * @returns Promise<boolean> - true si confirma, false si cancela
   */
  async confirm(config: ConfirmationConfig | string): Promise<boolean> {
    // Si recibe un string, convertirlo a config
    const modalConfig: ConfirmationConfig = typeof config === 'string' 
      ? { title: 'Confirmar', message: config }
      : config;

    // Crear el componente si no existe
    if (!this.modalComponentRef) {
      this.createModalComponent();
    }

    // Mostrar el modal y esperar respuesta
    if (this.modalComponentRef) {
      return await this.modalComponentRef.instance.show(modalConfig);
    }

    // Fallback al confirm nativo si algo falla
    return window.confirm(modalConfig.message);
  }

  /**
   * Crea el componente del modal dinámicamente
   */
  private createModalComponent(): void {
    // Crear el componente
    this.modalComponentRef = createComponent(ConfirmationModalComponent, {
      environmentInjector: this.injector
    });

    // Adjuntar al DOM
    const rootViewContainer = this.appRef.components[0];
    if (rootViewContainer) {
      const domElem = (this.modalComponentRef.hostView as any).rootNodes[0] as HTMLElement;
      document.body.appendChild(domElem);
    }

    // Adjuntar a la aplicación para detección de cambios
    this.appRef.attachView(this.modalComponentRef.hostView);
  }

  /**
   * Destruye el componente del modal
   */
  destroy(): void {
    if (this.modalComponentRef) {
      this.appRef.detachView(this.modalComponentRef.hostView);
      this.modalComponentRef.destroy();
      this.modalComponentRef = null;
    }
  }
}
