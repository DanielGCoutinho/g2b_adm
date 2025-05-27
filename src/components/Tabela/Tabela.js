// components/TabelaDinamica/TabelaDinamica.js
// ... (imports e outras funções como formatCurrency, formatQuantity, TabelaDinamicaLinha, CustomOption - sem alteração)

// Componente para o item arrastável de agrupamento (SortableGroupingKeyItem - sem alteração neste trecho)
function SortableGroupingKeyItem({ id, children }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 'auto',
    opacity: isDragging ? 0.6 : 1,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners} // Estes listeners são CRUCIAIS para arrastar!
      className={`${styles.groupingKeyItem} ${isDragging ? styles.isDragging : ''}`}
    >
      {children}
    </div>
  );
}


// Componente principal da tabela dinâmica
function TabelaDinamica({ data }) {
  // ... (estados, filterOptions, processData - sem alteração)

  // NOVO: Configuração dos sensores - AQUI É A MUDANÇA
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        // distance: 8, // COMENTE OU REMOVA ESTA LINHA
        // Ou defina para 0 para ativar imediatamente ao clicar:
        distance: 0,
      },
    })
  );

  // ... (handleDragEnd e o return do JSX - sem alteração)

  return (
    <div className={`${appStyles.box} ${styles.tabelaDinamicaBox}`}>
      {/* ... (seção de filtros) ... */}

      <div className={`${styles.filterSection} ${styles.groupingOrderSection}`}>
        <label className={styles.filterLabel}>Organizar Linhas por:</label>
        <DndContext
          sensors={sensors} // Usando os sensores configurados
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToWindowEdges]}
        >
          <SortableContext
            items={groupingKeys}
            strategy={horizontalListSortingStrategy}
          >
            <div className={styles.groupingKeysList}>
              {groupingKeys.map((key) => (
                <SortableGroupingKeyItem key={key} id={key}>
                  {key}
                </SortableGroupingKeyItem>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
      {/* ... (resto da tabela) ... */}
    </div>
  );
}

export default TabelaDinamica;