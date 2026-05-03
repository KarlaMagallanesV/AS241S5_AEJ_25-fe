import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface EmergencyResult {
  status: string;
  message: string;
  result: {
    emergencyType: string;
    severityLevel: string;
    immediateActions: { step: number; action: string; duration: string; warning?: string }[];
    doNotDo: string[];
    signsOfDeteriorating: string[];
    whenToRush: string;
    transportationTips: string[];
    emergencyContacts: { recommendation: string; poisonControl: string };
    stayCalm: string;
    disclaimer: string;
    metadata: { language: string; urgency: string };
  };
}

@Component({
  selector: 'app-emergency-result',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './emergency-result.component.html',
  styleUrl: './emergency-result.component.scss',
})
export class EmergencyResultComponent implements OnChanges {
  @Input() raw: object | string | null = null;

  parsed: EmergencyResult | null = null;

  ngOnChanges(): void {
    if (!this.raw) {
      this.parsed = null;
      return;
    }
    try {
      const obj = typeof this.raw === 'string' ? JSON.parse(this.raw) : this.raw;
      this.parsed = obj?.result ? (obj as EmergencyResult) : null;
    } catch {
      this.parsed = null;
    }
  }

  severityClass(level: string): string {
    const l = level?.toLowerCase();
    if (l === 'crítico' || l === 'critical') return 'severity-critical';
    if (l === 'alto' || l === 'high') return 'severity-high';
    if (l === 'moderado' || l === 'moderate') return 'severity-moderate';
    return 'severity-low';
  }
}
