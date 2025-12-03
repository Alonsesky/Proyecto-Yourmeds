export type HelpStep = {
  text: string;
  image?: any; // require('ruta')
};

export type HelpItem = {
  id: string;
  question: string;
  summary: string;
  steps: HelpStep[];
};

export const HELP_ITEMS: HelpItem[] = [
  {
    id: 'create-group',
    question: '¿Cómo crear un grupo de medicamentos?',
    summary: 'Te mostramos el flujo para crear un nuevo grupo desde la pantalla principal.',
    steps: [
      {
        text: 'Desde la pantalla de inicio, presiona el botón con el signo "+" en la parte inferior.',
        image: require('../../assets/ImaGrupo/cg1.jpg'),
      },
      {
        text: 'Selecciona la opción "Crear grupo".',
        image: require('../../assets/ImaGrupo/cg2.jpg'),
      },
      {
        text: 'Completa el nombre del grupo, el color y el tipo (privado/compartido).',
        image: require('../../assets/ImaGrupo/cg3.jpg'),
      },
      {
        text: 'Pulsa en "Confirmar" para crear el grupo.',
        image: require('../../assets/ImaGrupo/cg4.jpg'),
      },
      {
        text: 'Se visualizará un mensaje de creación exitosa.',
        image: require('../../assets/ImaGrupo/cg5.jpg'),
      },
    ],
  },
  {
    id: 'delete-group',
    question: '¿Cómo eliminar un grupo (Compartido o Privado)?',
    summary: 'Te mostramos el flujo para eliminar un grupo desde la pantalla principal.',
    steps: [
      {
        text: 'Desde la pantalla de inicio, presiona el botón con el símbolo "Basura", señalado con color rojo en la imagen de referencia.',
        image: require('../../assets/ImaGrupo/dg1.jpg'),
      },
      {
        text: 'Selecciona el grupo que se quiere eliminar.',
        image: require('../../assets/ImaGrupo/dg2.jpg'),
      },
      {
        text: 'Pulsar botón inferior "Presiona para eliminar" y se visualizará los cambios correspondientes.',
      },
    ],
  },
  {
    id: 'update-group',
    question: '¿Cómo editar un grupo?',
    summary: 'Te mostramos el flujo para editar un grupo desde la pantalla principal.',
    steps: [
      {
        text: 'Desde la pantalla de inicio, presiona el botón del grupo correspondiente en el signo "Editar", señalado con color rojo en la imagen de referencia.',
        image: require('../../assets/ImaGrupo/ug1.jpg'),
      },
      {
        text: 'Edita los campos requeridos del grupo seleccionado".',
        image: require('../../assets/ImaGrupo/ug2.jpg'),
      },
      {
        text: 'Pulsar "Guardar cambios" y los cambios se realizarán con éxito.',
        image: require('../../assets/ImaGrupo/ug3.jpg'),
      },
    ],
  },
  {
    id: 'create-alarm',
    question: '¿Cómo crear una alarma?',
    summary: 'Te mostramos el flujo para crear una nueva alarma desde la pantalla principal.',
    steps: [
      {
        text: 'Desde la pantalla de inicio, presiona el botón con el signo "+" en la parte inferior.',
        image: require('../../assets/ImaAlarma/ca1.jpg'),
      },
      {
        text: 'Debe existir un grupo para crear alarmas, en caso contrario estará bloqueado el botón".',
        image: require('../../assets/ImaAlarma/ca2.jpg'),
      },
      {
        text: 'Selecciona la opción "Alarma.',
        image: require('../../assets/ImaAlarma/ca3.jpg'),
      },
      {
        text: 'Rellenar todos los campos.',
        image: require('../../assets/ImaAlarma/ca4.jpg'),
      },
      {
        text: 'Presionar "Confirmar" para crear la alarma.',
        image: require('../../assets/ImaAlarma/ca5.jpg'),
      },
      {
        text: 'Finalmente se puede visualizar la creación de la alarma.',
        image: require('../../assets/ImaAlarma/ca6.jpg'),
      },
    ],
  },
  {
    id: 'delete-alarm',
    question: '¿Cómo eliminar una alarma?',
    summary: 'Te mostramos el flujo para eliminar una alarma desde la pantalla principal.',
    steps: [
      {
        text: 'Desde la pantalla de inicio, presiona el botón con el signo de "Basura" ubicado en la alarma que se requiere eliminar.',
        image: require('../../assets/ImaAlarma/da1.jpg'),
      },
      {
        text: 'Selecciona la opción "Presione para confirmar".',
        image: require('../../assets/ImaAlarma/da2.jpg'),
      },
      {
        text: 'Se realiza la eliminación y se visualizan los cambios.',
        image: require('../../assets/ImaAlarma/da3.jpg'),
      },
    ],
  },
  {
    id: 'update-alarm',
    question: '¿Cómo editar una alarma?',
    summary: 'Te mostramos el flujo para editar una nueva alarma desde la pantalla principal.',
    steps: [
      {
        text: 'Desde la pantalla de inicio, presiona el botón con el icono "editar" como se muestra en el ejemplo.',
        image: require('../../assets/ImaAlarma/ua1.jpg'),
      },
      {
        text: 'Rellenar los cambios a realizar y  presionar el botón "Guardar".',
        image: require('../../assets/ImaAlarma/ua2.jpg'),
      },
      {
        text: 'Se visualizan los cambios correspondientes.',
        image: require('../../assets/ImaAlarma/ua3.jpg'),
      },
    ],
  },
  
];
