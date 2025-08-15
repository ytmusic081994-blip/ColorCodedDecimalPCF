/// <reference types="powerapps-component-framework" />

interface IInputs {
    dataset: ComponentFramework.PropertyTypes.DataSet;
    columnsToColor: ComponentFramework.PropertyTypes.StringProperty;
}

interface IOutputs {
    // Add output properties if needed
}

export class ColorCodedDecimalGrid implements ComponentFramework.StandardControl<IInputs, IOutputs> {
    private _container: HTMLDivElement;
    private _context: ComponentFramework.Context<IInputs>;
    private _notifyOutputChanged: () => void;
    private _columnsToColor: string[] = [];

    public init(
        context: ComponentFramework.Context<IInputs>,
        notifyOutputChanged: () => void,
        state: ComponentFramework.Dictionary,
        container: HTMLDivElement
    ): void {
        console.group('[PCF] INITIALIZING CONTROL');
        this._container = container;
        this._context = context;
        this._notifyOutputChanged = notifyOutputChanged;
        
        console.log('[PCF] Container:', container);
        console.log('[PCF] Initial context:', context);
        
        // Debug columnsToColor property
        const columnsToColor = context.parameters.columnsToColor.raw;
        console.log('[PCF] Raw columnsToColor:', columnsToColor);
        
        if (columnsToColor) {
            this._columnsToColor = columnsToColor.split(',').map(col => col.trim());
            console.log('[PCF] Processed columns to color:', this._columnsToColor);
        } else {
            console.warn('[PCF] No columnsToColor specified');
        }
        
        console.log('[PCF] Dataset parameters:', context.parameters.dataset);
        console.groupEnd();
        
        this.renderGrid();
    }

    private renderGrid(): void {
        console.group('[PCF] RENDERING GRID');
        this._container.innerHTML = '';
        
        // Debug dataset availability
        if (!this._context.parameters.dataset) {
            console.error('[PCF] Dataset parameter is undefined');
            this._container.innerHTML = '<div class="no-data">Dataset not available</div>';
            console.groupEnd();
            return;
        }
        
        if (!this._context.parameters.dataset.columns) {
            console.error('[PCF] Dataset columns are undefined');
            this._container.innerHTML = '<div class="no-data">No columns defined</div>';
            console.groupEnd();
            return;
        }
        
        if (this._context.parameters.dataset.sortedRecordIds.length === 0) {
            console.warn('[PCF] No records in dataset');
            this._container.innerHTML = '<div class="no-data">No data available</div>';
            console.groupEnd();
            return;
        }

        console.log('[PCF] Dataset columns:', this._context.parameters.dataset.columns);
        console.log('[PCF] Record IDs:', this._context.parameters.dataset.sortedRecordIds);

        const table = document.createElement('table');
        table.className = 'color-coded-grid';

        // Create header row with debug info
        const headerRow = table.createTHead().insertRow();
        this._context.parameters.dataset.columns.forEach(column => {
            const th = document.createElement('th');
            th.innerText = column.displayName;
            th.title = `Name: ${column.name} | Type: ${column.dataType}`; // Debug tooltip
            headerRow.appendChild(th);
        });

        // Create data rows with value debugging
        const tbody = table.createTBody();
        this._context.parameters.dataset.sortedRecordIds.forEach(recordId => {
            console.groupCollapsed(`[PCF] Rendering record ${recordId}`);
            const row = tbody.insertRow();
            const record = this._context.parameters.dataset.records[recordId];
            console.log('[PCF] Record data:', record);

            this._context.parameters.dataset.columns.forEach(column => {
                const cell = row.insertCell();
                const rawValue = record.getValue(column.name);
                const formattedValue = record.getFormattedValue(column.name) || '';
                
                console.log(`[PCF] Processing column ${column.name}:`, {
                    rawValue,
                    formattedValue,
                    isNumber: typeof rawValue === 'number',
                    shouldColor: this._columnsToColor.indexOf(column.name) >= 0
                });

                // Apply color coding if column is in configured list
                if (this._columnsToColor.indexOf(column.name) >= 0 && typeof rawValue === 'number') {
                    const numericValue = parseFloat(rawValue.toString());
                    const colorClass = this.getValueColorClass(numericValue);
                    console.log(`[PCF] Applying color class ${colorClass} to ${column.name}`);
                    
                    cell.classList.add(colorClass);
                    cell.innerText = `${Math.round(numericValue)}%`;
                    cell.title = `Original value: ${rawValue}`; // Debug tooltip
                } else {
                    cell.innerText = formattedValue;
                }
            });
            console.groupEnd();
        });

        this._container.appendChild(table);
        console.log('[PCF] Grid rendered successfully');
        console.groupEnd();
    }

    private getValueColorClass(value: number): string {
        if (isNaN(value)) {
            console.warn('[PCF] Invalid number value received');
            return '';
        }
        
        if (value >= 0 && value <= 25) return 'low-value';
        if (value > 25 && value <= 75) return 'medium-value';
        return 'high-value';
    }

    public updateView(context: ComponentFramework.Context<IInputs>): void {
        console.group('[PCF] UPDATING VIEW');
        console.log('[PCF] New context:', context);
        this._context = context;
        this.renderGrid();
        console.groupEnd();
    }

    public getOutputs(): IOutputs {
        console.log('[PCF] Getting outputs');
        return {};
    }

    public destroy(): void {
        console.log('[PCF] Destroying control');
        // Cleanup code if needed
    }
}